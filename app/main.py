import json
import logging
import math
import os
import random
import secrets
import smtplib
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Annotated, Any, Dict, List, Optional, Tuple

import jwt as pyjwt
from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Select, and_, asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .logging_config import RequestResponseLoggingMiddleware, configure_logging
from .database import configure_engine, get_session, init_db
from .db.models import Contact, Order, Product, ReturnRequest, User
from .core.security import (
    create_access_token,
    decode_token,
    extract_bearer_token,
    public_user_profile,
    razorpay_signature_matches,
    safe_int_id,
    serialize_document,
    get_token_user_id_role,
    hash_password,
    verify_password,
)

settings = get_settings()
configure_logging(settings)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_FRONTEND_DIST = _BACKEND_ROOT / "app" / "frontend_dist"
UPLOAD_DIR = str(_BACKEND_ROOT / settings["upload_dir"])
os.makedirs(UPLOAD_DIR, exist_ok=True)

configure_engine(settings)

app = FastAPI(title="Tamil Nadu Products API (FastAPI)")

# Frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "frontend_dist")
if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

allowed_origins = [
    settings.get("frontend_url"),
    "https://tamilnaduproducts.com",
]
allowed_origins = [o for o in allowed_origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestResponseLoggingMiddleware)


@app.middleware("http")
async def _spa_fallback_on_404(request: Request, call_next):
    """If no route/static file matched, serve index.html so React Router paths work on reload."""
    response = await call_next(request)
    if response.status_code != 404 or request.method != "GET":
        return response
    path = request.url.path
    if path.startswith("/api") or path.startswith("/assets/") or path.startswith("/images/") or path.startswith("/uploads"):
        return response
    if path in ("/favicon.ico", "/vite.svg"):
        return response
    index = _FRONTEND_DIST / "index.html"
    if not index.is_file():
        return response
    return FileResponse(index)


SessionDep = Annotated[AsyncSession, Depends(get_session)]


@app.on_event("startup")
async def _startup() -> None:
    logging.getLogger("app").info("Starting up; database init…")
    await init_db()
    logging.getLogger("app").info("Database ready.")
    
    # Log frontend_dist status
    if _FRONTEND_DIST.is_dir():
        logging.getLogger("app").info(f"Frontend dist found at: {_FRONTEND_DIST}")
    else:
        logging.getLogger("app").info("Frontend dist not found - API will run in backend-only mode")


def _json_dumps(data: Any) -> str:
    return json.dumps(data, default=lambda x: x.isoformat() if isinstance(x, datetime) else str(x))


def _json_error(
    status_code: int,
    *,
    success: bool = False,
    message: Optional[str] = None,
    error: Optional[str] = None,
    details: Any = None,
) -> JSONResponse:
    payload: Dict[str, Any] = {"success": success}
    if message is not None:
        payload["message"] = message
    if error is not None:
        payload["error"] = error
    if details is not None:
        payload["details"] = details
    return JSONResponse(status_code=status_code, content=payload)


def user_orm_to_api_dict(u: User) -> Dict[str, Any]:
    address = None
    if u.address_json:
        try:
            address = json.loads(u.address_json)
        except json.JSONDecodeError:
            address = None
    return {
        "_id": u.id,
        "firstName": u.first_name,
        "lastName": u.last_name,
        "email": u.email,
        "phone": u.phone,
        "password": u.password_hash,
        "role": u.role,
        "isAdmin": u.is_admin,
        "isGoogleUser": u.is_google_user,
        "emailVerified": u.email_verified,
        "phoneVerified": u.phone_verified,
        "active": u.active,
        "address": address,
        "loginCount": u.login_count,
        "lastLogin": u.last_login,
        "createdAt": u.created_at,
        "updatedAt": u.updated_at,
    }


def product_orm_to_api_dict(p: Product) -> Dict[str, Any]:
    try:
        images = json.loads(p.images_json or "[]")
    except (json.JSONDecodeError, TypeError):
        images = []
    
    try:
        sizes = json.loads(p.sizes_json or "[]")
    except (json.JSONDecodeError, TypeError):
        sizes = []
    
    try:
        colors = json.loads(p.colors_json or "[]")
    except (json.JSONDecodeError, TypeError):
        colors = []
    
    try:
        tags = json.loads(p.tags_json or "[]")
    except (json.JSONDecodeError, TypeError):
        tags = []
    
    try:
        size_stock = json.loads(p.size_stock_json or "{}")
    except (json.JSONDecodeError, TypeError):
        size_stock = {}
    
    try:
        seo = json.loads(p.seo_json) if p.seo_json else None
    except (json.JSONDecodeError, TypeError):
        seo = None
    
    try:
        specs = json.loads(p.specifications_json) if p.specifications_json else None
    except (json.JSONDecodeError, TypeError):
        specs = None
    return {
        "_id": p.id,
        "name": p.name,
        "slug": p.slug,
        "description": p.description,
        "shortDescription": p.short_description,
        "category": p.category,
        "price": p.price,
        "originalPrice": p.original_price,
        "images": images,
        "sizes": sizes,
        "colors": colors,
        "stock": p.stock,
        "sizeStock": size_stock,
        "rating": p.rating,
        "reviews": p.reviews,
        "tags": tags,
        "featured": p.featured,
        "active": p.active,
        "seo": seo,
        "specifications": specs,
        "createdAt": p.created_at.isoformat() if p.created_at else None,
        "updatedAt": p.updated_at.isoformat() if p.updated_at else None,
    }


def order_orm_to_api_dict(o: Order, customer_embed: Any = None) -> Dict[str, Any]:
    items = json.loads(o.items_json or "[]")
    ship = json.loads(o.shipping_json or "{}")
    hist = json.loads(o.status_history_json or "[]")
    cust = o.customer_id if customer_embed is None else customer_embed
    return {
        "_id": o.id,
        "orderId": o.order_id,
        "customer": cust,
        "items": items,
        "shippingAddress": ship,
        "subtotal": o.subtotal,
        "total": o.total,
        "status": o.status,
        "paymentMethod": o.payment_method,
        "paymentStatus": o.payment_status,
        "paymentId": o.payment_id,
        "razorpayOrderId": o.razorpay_order_id,
        "razorpayPaymentId": o.razorpay_payment_id,
        "razorpaySignature": o.razorpay_signature,
        "trackingNumber": o.tracking_number,
        "estimatedDelivery": o.estimated_delivery,
        "actualDelivery": o.actual_delivery,
        "statusHistory": hist,
        "createdAt": o.created_at,
        "updatedAt": o.updated_at,
    }


async def _get_authenticated_user(
    request: Request, session: AsyncSession
) -> Tuple[Optional[Dict[str, Any]], Optional[JSONResponse]]:
    token = extract_bearer_token(request)
    if not token:
        return None, _json_error(401, error="Access denied. No token provided.")

    try:
        decoded = decode_token(token, jwt_secret=settings["jwt_secret"])
    except pyjwt.PyJWTError:
        return None, _json_error(401, error="Invalid token")

    user_id, _ = get_token_user_id_role(decoded)
    uid = safe_int_id(user_id)
    if uid is None:
        return None, _json_error(401, error="Invalid token")

    result = await session.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        return None, _json_error(401, error="User not found")

    if not user.active:
        return None, _json_error(401, error="Account is deactivated")

    return user_orm_to_api_dict(user), None


def _require_admin(user_doc: Dict[str, Any]) -> Optional[JSONResponse]:
    if not user_doc.get("isAdmin") and user_doc.get("role") != "admin":
        return _json_error(403, error="Access denied. Admin privileges required.")
    return None


class RegisterPayload(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    password: str = Field(min_length=6)


class LoginPayload(BaseModel):
    identifier: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str


class VerifyOtpPayload(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=4, max_length=10)
    purpose: str = Field(pattern="^(register|login)$")


class ProfilePayload(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[Dict[str, Any]] = None


class CreateOrderPayload(BaseModel):
    customerEmail: EmailStr
    products: List[Dict[str, Any]] = Field(min_length=1)
    totalAmount: float
    customerName: str
    customerPhone: str
    shippingAddress: Dict[str, Any]


class UpdateOrderStatusPayload(BaseModel):
    status: str
    note: Optional[str] = None


class AdminUpdateProductPayload(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    originalPrice: Optional[float] = None
    image: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    active: Optional[bool] = None


class AdminCreateProductPayload(BaseModel):
    name: str
    description: str = ""
    category: str
    price: float
    originalPrice: Optional[float] = None
    image: Optional[str] = None
    stock: int = 0
    featured: bool = False
    active: bool = True


class CreatePaymentOrderPayload(BaseModel):
    amount: int
    orderId: str
    items: Optional[List[Dict[str, Any]]] = None
    subtotal: Optional[float] = None
    shipping: Optional[float] = None
    handling: Optional[float] = None


class VerifyPaymentPayload(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    orderId: str


class ContactPayload(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    category: Optional[str] = "general"


class ReturnCreatePayload(BaseModel):
    orderId: str
    email: EmailStr
    items: List[Dict[str, Any]] = Field(default_factory=list)
    reason: str
    condition: str = "new"
    images: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


def _product_list_filters(
    *,
    category: Optional[str],
    search: Optional[str],
    featured: Optional[str],
    min_price_raw: Optional[str],
    max_price_raw: Optional[str],
    size: Optional[str],
    color: Optional[str],
) -> List[Any]:
    conds: List[Any] = [Product.active.is_(True)]
    if category:
        conds.append(Product.category == category)
    if featured == "true":
        conds.append(Product.featured.is_(True))
    if search:
        term = f"%{search}%"
        conds.append(
            or_(
                Product.name.ilike(term),
                Product.description.ilike(term),
                Product.tags_json.ilike(term),
            )
        )
    if min_price_raw:
        conds.append(Product.price >= float(min_price_raw))
    if max_price_raw:
        conds.append(Product.price <= float(max_price_raw))
    if size:
        conds.append(Product.sizes_json.like(f"%\"{size}\"%"))
    if color:
        conds.append(Product.colors_json.like(f"%{color}%"))
    return conds


def _slugify(text: str) -> str:
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in text).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug or f"product-{secrets.token_hex(4)}"


OTP_EXPIRY_MINUTES = 30
_otp_store: Dict[str, Dict[str, Any]] = {}


def _generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"


def _store_otp(email: str, purpose: str, data: Dict[str, Any]) -> str:
    otp = _generate_otp()
    _otp_store[email.lower()] = {
        "otp": otp,
        "purpose": purpose,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES),
        "data": data,
    }
    return otp


def _otp_debug_value(otp: str) -> Optional[str]:
    if settings.get("env") != "production":
        return otp
    return None


def _send_otp_email(to_email: str, otp: str, purpose: str) -> Tuple[bool, Optional[str]]:
    smtp_host = settings.get("smtp_host")
    smtp_user = settings.get("smtp_user")
    smtp_password = settings.get("smtp_password")
    from_email = settings.get("smtp_from_email") or smtp_user
    smtp_port = int(settings.get("smtp_port") or 587)
    smtp_use_tls = bool(settings.get("smtp_use_tls"))
    smtp_use_ssl = bool(settings.get("smtp_use_ssl"))

    if not smtp_host or not smtp_user or not smtp_password or not from_email:
        return False, "OTP email service is not configured. Please set SMTP env values."

    action_label = "sign in" if purpose == "login" else "complete sign up"
    msg = EmailMessage()
    msg["Subject"] = f"Your OTP for {settings.get('smtp_from_name') or 'Tamil Nadu Products'}"
    msg["From"] = f"{settings.get('smtp_from_name') or 'Tamil Nadu Products'} <{from_email}>"
    msg["To"] = to_email
    msg.set_content(
        (
            f"Your OTP to {action_label} is: {otp}\n\n"
            f"This OTP expires in {OTP_EXPIRY_MINUTES} minutes.\n"
            "If you did not request this, please ignore this email."
        )
    )

    try:
        if smtp_use_ssl:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=20) as server:
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
                if smtp_use_tls:
                    server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
        return True, None
    except Exception as exc:
        logging.getLogger("app").exception("Failed sending OTP email to %s", to_email)
        return False, str(exc)


def _validate_otp(email: str, otp: str, purpose: str) -> Tuple[Optional[Dict[str, Any]], Optional[JSONResponse]]:
    item = _otp_store.get(email.lower())
    if not item:
        return None, _json_error(400, message="OTP not found. Please request OTP again.")
    if item.get("purpose") != purpose:
        return None, _json_error(400, message="OTP purpose mismatch. Please request OTP again.")
    if datetime.now(timezone.utc) > item.get("expires_at", datetime.now(timezone.utc)):
        _otp_store.pop(email.lower(), None)
        return None, _json_error(400, message="OTP expired. Please request OTP again.")
    if str(item.get("otp")) != str(otp):
        return None, _json_error(400, message="Invalid OTP")
    return item, None


def _safe_upload_extension(filename: str, content_type: str) -> Optional[str]:
    allowed_by_type = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }
    if content_type in allowed_by_type:
        return allowed_by_type[content_type]
    suffix = Path(filename or "").suffix.lower()
    if suffix in (".jpg", ".jpeg", ".png", ".webp"):
        return ".jpg" if suffix == ".jpeg" else suffix
    return None


async def _unique_product_slug(session: AsyncSession, base_name: str, *, exclude_product_id: Optional[int] = None) -> str:
    base_slug = _slugify(base_name)
    slug = base_slug
    suffix = 2
    while True:
        existing_id = (await session.execute(select(Product.id).where(Product.slug == slug))).scalar_one_or_none()
        if existing_id is None or (exclude_product_id is not None and int(existing_id) == int(exclude_product_id)):
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


@app.get("/api/health")
async def health() -> JSONResponse:
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Server is running",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "environment": settings.get("env"),
        },
    )


@app.post("/api/auth/register", status_code=201)
async def register(payload: RegisterPayload, session: SessionDep) -> JSONResponse:
    email = payload.email.lower()
    phone = payload.phone

    if (await session.execute(select(User).where(User.email == email))).scalar_one_or_none():
        return _json_error(400, message="Email already registered")
    if (await session.execute(select(User).where(User.phone == phone))).scalar_one_or_none():
        return _json_error(400, message="Phone number already registered")

    otp = _store_otp(
        email,
        "register",
        {
            "firstName": payload.firstName,
            "lastName": payload.lastName,
            "email": email,
            "phone": phone,
            "passwordHash": hash_password(payload.password),
        },
    )
    
    # For development: try to send email but don't fail if SMTP is not configured
    sent, send_err = _send_otp_email(email, otp, "register")
    if not sent:
        # Log the error but don't fail registration for development
        logging.getLogger("app").warning("OTP email not sent: %s", send_err or "Unknown error")

    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "OTP sent. Verify OTP to complete registration.",
            "data": {"email": email, "purpose": "register", "otp": _otp_debug_value(otp)},
        },
    )


@app.post("/api/auth/login")
async def login(payload: LoginPayload, session: SessionDep) -> JSONResponse:
    raw_identifier = (payload.identifier or (str(payload.email).lower() if payload.email else "")).strip()
    if not raw_identifier:
        return _json_error(400, message="Email or phone is required")

    identifier = raw_identifier.lower()
    result = await session.execute(
        select(User).where(or_(User.email == identifier, User.phone == raw_identifier))
    )
    user = result.scalar_one_or_none()
    if not user:
        return _json_error(401, message="Invalid email or password")

    if not verify_password(payload.password, user.password_hash):
        return _json_error(401, message="Invalid email or password")

    if not user.active:
        return _json_error(401, message="Account is deactivated")

    otp = _store_otp(
        user.email,
        "login",
        {"userId": user.id},
    )
    
    # For development: try to send email but don't fail if SMTP is not configured
    sent, send_err = _send_otp_email(user.email, otp, "login")
    if not sent:
        # Log the error but don't fail login for development
        logging.getLogger("app").warning("OTP email not sent: %s", send_err or "Unknown error")

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "OTP sent. Verify OTP to complete login.",
            "data": {"email": user.email, "purpose": "login", "otp": _otp_debug_value(otp)},
        },
    )


@app.post("/api/auth/verify-otp")
async def verify_otp(payload: VerifyOtpPayload, session: SessionDep) -> JSONResponse:
    email = payload.email.lower()
    otp_item, otp_err = _validate_otp(email, payload.otp, payload.purpose)
    if otp_err:
        return otp_err

    if payload.purpose == "register":
        reg_data = (otp_item or {}).get("data", {})
        if (await session.execute(select(User).where(User.email == email))).scalar_one_or_none():
            _otp_store.pop(email, None)
            return _json_error(400, message="Email already registered")
        if (await session.execute(select(User).where(User.phone == reg_data.get("phone")))).scalar_one_or_none():
            _otp_store.pop(email, None)
            return _json_error(400, message="Phone number already registered")

        user = User(
            first_name=reg_data.get("firstName", ""),
            last_name=reg_data.get("lastName", ""),
            email=email,
            phone=reg_data.get("phone", ""),
            password_hash=reg_data.get("passwordHash", ""),
            role="customer",
            email_verified=True,
        )
        session.add(user)
        await session.flush()
        await session.refresh(user)
        _otp_store.pop(email, None)

        ud = user_orm_to_api_dict(user)
        token = create_access_token(
            user_id=str(user.id),
            role=user.role,
            jwt_secret=settings["jwt_secret"],
            expires_days=7,
        )
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Registration verified successfully",
                "data": {"user": public_user_profile(ud), "token": token, "role": user.role},
            },
        )

    # purpose=login
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        _otp_store.pop(email, None)
        return _json_error(401, message="User not found")
    if not user.active:
        _otp_store.pop(email, None)
        return _json_error(401, message="Account is deactivated")

    now = datetime.now(timezone.utc)
    user.last_login = now
    user.login_count = user.login_count + 1
    user.email_verified = True
    session.add(user)
    _otp_store.pop(email, None)

    ud = user_orm_to_api_dict(user)
    token = create_access_token(
        user_id=str(user.id),
        role=user.role,
        jwt_secret=settings["jwt_secret"],
        expires_days=7,
    )
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Login successful",
            "data": {
                "user": public_user_profile(ud),
                "token": token,
                "role": user.role,
            },
        },
    )


@app.post("/api/auth/admin/login")
async def admin_login(payload: LoginPayload, session: SessionDep) -> JSONResponse:
    ADMIN_EMAIL = "admin@tamilnaduproducts.com"

    if payload.email.lower() != ADMIN_EMAIL:
        return _json_error(403, message="Access denied. Only admin can access this portal.")

    result = await session.execute(select(User).where(User.email == payload.email.lower(), User.role == "admin"))
    user = result.scalar_one_or_none()
    if not user:
        return _json_error(401, message="Invalid admin credentials")

    if not verify_password(payload.password, user.password_hash):
        return _json_error(401, message="Invalid admin credentials")

    if not user.active:
        return _json_error(401, message="Admin account is deactivated")

    now = datetime.now(timezone.utc)
    user.last_login = now
    user.login_count = user.login_count + 1
    session.add(user)

    ud = user_orm_to_api_dict(user)
    token = create_access_token(
        user_id=str(user.id),
        role="admin",
        jwt_secret=settings["jwt_secret"],
        expires_days=7,
    )

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Admin login successful",
            "data": {"user": public_user_profile(ud), "token": token, "role": "admin"},
        },
    )


@app.get("/api/auth/me")
async def me(request: Request, session: SessionDep) -> JSONResponse:
    token = extract_bearer_token(request)
    if not token:
        return _json_error(401, message="No token provided")

    try:
        decoded = decode_token(token, jwt_secret=settings["jwt_secret"])
    except pyjwt.PyJWTError:
        return _json_error(401, message="Invalid token")

    user_id, _ = get_token_user_id_role(decoded)
    uid = safe_int_id(user_id)
    if uid is None:
        return _json_error(401, message="Invalid token")

    result = await session.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        return _json_error(401, message="User not found")

    ud = user_orm_to_api_dict(user)
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": public_user_profile(ud),
        },
    )


@app.put("/api/auth/profile")
async def update_profile(payload: ProfilePayload, request: Request, session: SessionDep) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err

    uid = int(user_doc["_id"])
    result = await session.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        return _json_error(401, message="User not found")

    if payload.firstName is not None:
        user.first_name = payload.firstName
    if payload.lastName is not None:
        user.last_name = payload.lastName
    if payload.email is not None:
        new_email = payload.email.lower()
        if new_email != user.email:
            existing = (await session.execute(select(User).where(User.email == new_email))).scalar_one_or_none()
            if existing:
                return _json_error(400, message="Email already registered")
            user.email = new_email
    if payload.phone is not None:
        new_phone = payload.phone
        if new_phone != user.phone:
            existing = (await session.execute(select(User).where(User.phone == new_phone))).scalar_one_or_none()
            if existing:
                return _json_error(400, message="Phone number already registered")
            user.phone = new_phone
    if payload.address is not None:
        user.address_json = json.dumps(payload.address)

    user.updated_at = datetime.now(timezone.utc)
    session.add(user)
    await session.flush()

    ud = user_orm_to_api_dict(user)
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Profile updated successfully",
            "data": public_user_profile(ud),
        },
    )


@app.get("/api/products")
async def list_products(request: Request, session: SessionDep) -> JSONResponse:
    q = request.query_params
    page = int(q.get("page", 1))
    limit = int(q.get("limit", 20))
    category = q.get("category")
    search = q.get("search")
    featured = q.get("featured")
    min_price_raw = q.get("minPrice")
    max_price_raw = q.get("maxPrice")
    size = q.get("size")
    color = q.get("color")

    conds = _product_list_filters(
        category=category,
        search=search,
        featured=featured,
        min_price_raw=min_price_raw,
        max_price_raw=max_price_raw,
        size=size,
        color=color,
    )

    result = await session.execute(
        select(Product)
        .where(and_(*conds))
        .order_by(Product.featured.desc(), Product.created_at.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    products = result.scalars().all()

    total_result = await session.execute(
        select(func.count(Product.id)).where(and_(*conds))
    )
    total = total_result.scalar() or 0

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "products": [product_orm_to_api_dict(p) for p in products],
                "pagination": {
                    "current": page,
                    "pages": int(math.ceil(total / float(limit))) if limit else 1,
                    "total": total,
                },
            },
        },
    )


@app.get("/api/products/{product_id}")
async def get_product(product_id: str, session: SessionDep) -> JSONResponse:
    pid = safe_int_id(product_id)
    if pid is None:
        return _json_error(400, message="Invalid product ID")

    result = await session.execute(select(Product).where(Product.id == pid, Product.active.is_(True)))
    product = result.scalar_one_or_none()
    if not product:
        return _json_error(404, message="Product not found")

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": product_orm_to_api_dict(product),
        },
    )


def _base36_encode(num: int) -> str:
    digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if num == 0:
        return "0"
    out = ""
    n = num
    while n:
        n, i = divmod(n, 36)
        out = digits[i] + out
    return out


async def _validate_order_items_stock(session: AsyncSession, products_payload: List[Dict[str, Any]]) -> Optional[JSONResponse]:
    """Ensure each line item has enough inventory before creating an order."""
    for p in products_payload:
        pid = safe_int_id(p.get("productId"))
        qty = int(p.get("quantity") or 0)
        if pid is None:
            return _json_error(400, message="Invalid product in order")
        if qty <= 0:
            return _json_error(400, message="Each product must have quantity greater than zero")
        result = await session.execute(select(Product).where(Product.id == pid))
        product = result.scalar_one_or_none()
        if not product:
            return _json_error(400, message=f"Product with ID {pid} not found")
        if not product.active:
            return _json_error(400, message=f"Product {product.name} is not available")
        size_stock = json.loads(product.size_stock_json or "{}")
        size = p.get("size", "M")
        available = int(size_stock.get(size, product.stock or 0))
        if qty > available:
            return _json_error(400, message=f"Insufficient stock for {product.name} (size {size}). Available: {available}")
    return None


async def _decrement_stock_for_order_items(session: AsyncSession, products_payload: List[Dict[str, Any]]) -> Optional[JSONResponse]:
    """Decrement stock for ordered items."""
    for p in products_payload:
        pid = safe_int_id(p.get("productId"))
        qty = int(p.get("quantity") or 0)
        result = await session.execute(select(Product).where(Product.id == pid))
        product = result.scalar_one_or_none()
        if not product:
            continue
        size_stock = json.loads(product.size_stock_json or "{}")
        size = p.get("size", "M")
        current_stock = int(size_stock.get(size, product.stock or 0))
        new_stock = max(0, current_stock - qty)
        if size in size_stock:
            size_stock[size] = new_stock
        else:
            product.stock = new_stock
        product.size_stock_json = json.dumps(size_stock)
        session.add(product)
    return None


@app.post("/api/orders/create-order", status_code=201)
async def create_order(payload: CreateOrderPayload, request: Request, session: SessionDep) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    uid = int(user_doc["_id"])
    account_email = (user_doc.get("email") or "").lower()
    if str(payload.customerEmail).lower() != account_email:
        return _json_error(400, message="Customer email must match your signed-in account.")

    now = datetime.now(timezone.utc)

    stock_err = await _validate_order_items_stock(session, payload.products)
    if stock_err:
        return stock_err

    order_id = f"ORD-{now.strftime('%Y%m%d')}-{_base36_encode(now.timestamp() * 1000)}"

    items = []
    for p in payload.products:
        result = await session.execute(select(Product).where(Product.id == int(p["productId"])))
        product = result.scalar_one_or_none()
        if product:
            items.append(
                {
                    "productId": product.id,
                    "name": product.name,
                    "price": p.get("price") or product.price,
                    "quantity": p.get("quantity"),
                    "size": p.get("size") or "M",
                    "image": p.get("image"),
                    "subtotal": (p.get("price") or 0) * (p.get("quantity") or 0),
                }
            )

    shipping_address: Dict[str, Any] = {
        "fullName": payload.customerName,
        "phone": payload.customerPhone,
        "email": payload.customerEmail.lower(),
        "country": "India",
        **payload.shippingAddress,
    }

    hist = [{"status": "ordered", "timestamp": now, "note": "Order placed successfully"}]
    order_row = Order(
        order_id=order_id,
        customer_id=uid,
        items_json=_json_dumps(items),
        shipping_json=_json_dumps(shipping_address),
        subtotal=payload.totalAmount,
        total=payload.totalAmount,
        status="ordered",
        payment_method="razorpay",
        payment_status="pending",
        status_history_json=_json_dumps(hist),
    )
    session.add(order_row)
    await session.flush()

    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "Order created successfully",
            "data": {
                "orderId": order_id,
                "status": "ordered",
                "total": payload.totalAmount,
                "createdAt": now,
            },
        },
    )


@app.get("/api/orders/my-orders")
async def my_orders(request: Request, session: SessionDep) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    uid = int(user_doc["_id"])

    q = request.query_params
    page = int(q.get("page", 1))
    limit = int(q.get("limit", 10))

    result = await session.execute(
        select(Order)
        .where(Order.customer_id == uid)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    orders = result.scalars().all()

    total_result = await session.execute(
        select(func.count(Order.id)).where(Order.customer_id == uid)
    )
    total = total_result.scalar() or 0

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "orders": [order_orm_to_api_dict(o) for o in orders],
                "pagination": {
                    "current": page,
                    "pages": int(math.ceil(total / float(limit))) if limit else 1,
                    "total": total,
                },
            },
        },
    )


@app.get("/api/orders/order-status-options")
async def order_status_options() -> JSONResponse:
    opts = [
        {"value": "ordered", "label": "Ordered", "description": "Order has been placed"},
        {"value": "shipped", "label": "Shipped", "description": "Order has been shipped"},
        {"value": "out-for-delivery", "label": "Out for Delivery", "description": "Order is out for delivery"},
        {"value": "delivered", "label": "Delivered", "description": "Order has been delivered"},
    ]
    return JSONResponse(status_code=200, content={"success": True, "data": opts})


@app.put("/api/orders/update-order/{order_id}")
async def update_order_status(
    order_id: str, payload: UpdateOrderStatusPayload, request: Request, session: SessionDep
) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    now = datetime.now(timezone.utc)

    if not payload.status:
        return _json_error(400, message="Validation errors", details=["status is required"])

    result = await session.execute(select(Order).where(Order.order_id == order_id.upper()))
    doc = result.scalar_one_or_none()
    if not doc:
        return _json_error(404, message="Order not found")

    doc.status = payload.status
    hist = json.loads(doc.status_history_json or "[]")
    hist.append({"status": payload.status, "timestamp": now, "note": payload.note or ""})
    doc.status_history_json = json.dumps(hist)
    if payload.note:
        doc.notes = payload.note
    session.add(doc)

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Order status updated successfully",
            "data": {
                "orderId": doc.order_id,
                "status": doc.get("status"),
                "trackingNumber": doc.get("trackingNumber"),
                "estimatedDelivery": doc.get("estimatedDelivery"),
                "actualDelivery": doc.get("actualDelivery"),
                "updatedAt": doc.get("updatedAt") or now,
            },
        },
    )


@app.get("/api/payments/config")
async def payments_config() -> JSONResponse:
    key_id = settings.get("razorpay_key_id") or ""
    return JSONResponse(status_code=200, content={"success": True, "keyId": key_id})


@app.post("/api/payments/create-order")
async def payments_create_order(
    payload: CreatePaymentOrderPayload, request: Request, session: SessionDep
) -> JSONResponse:
    user_doc, auth_err = await _get_authenticated_user(request, session)
    if auth_err:
        return auth_err
    uid = int(user_doc["_id"])
    razor_key_id = settings.get("razorpay_key_id")
    razor_key_secret = settings.get("razorpay_key_secret")
    if not razor_key_id or not razor_key_secret:
        return _json_error(500, error="Payment service not configured")

    result = await session.execute(select(Order).where(Order.order_id == payload.orderId.upper()))
    order_doc = result.scalar_one_or_none()
    if not order_doc:
        return _json_error(404, error="Order not found")
    if order_doc.customer_id is None or order_doc.customer_id != uid:
        return _json_error(403, error="You can only pay for orders placed on your account.")

    from razorpay import Client as RazorpayClient

    rzp = RazorpayClient(auth=(razor_key_id, razor_key_secret))

    razorpay_order = rzp.order.create(
        {"amount": payload.amount, "currency": "INR", "receipt": order_doc.order_id, "notes": {"orderId": order_doc.order_id}}
    )

    order_doc.razorpay_order_id = razorpay_order.get("id")
    order_doc.payment_status = "processing"
    session.add(order_doc)

    return JSONResponse(status_code=200, content={"success": True, "data": razorpay_order})


@app.post("/api/payments/verify")
async def payments_verify(payload: VerifyPaymentPayload, request: Request, session: SessionDep) -> JSONResponse:
    user_doc, auth_err = await _get_authenticated_user(request, session)
    if auth_err:
        return auth_err
    uid = int(user_doc["_id"])
    razor_key_secret = settings.get("razorpay_key_secret")
    if not razor_key_secret:
        return _json_error(500, error="Payment service not configured")

    result = await session.execute(select(Order).where(Order.order_id == payload.orderId.upper()))
    order_doc = result.scalar_one_or_none()
    if not order_doc:
        return _json_error(404, error="Order not found")
    if order_doc.customer_id is None or order_doc.customer_id != uid:
        return _json_error(403, error="You can only verify payment for your own orders.")

    is_valid = razorpay_signature_matches(
        razor_key_secret,
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
    )
    if not is_valid:
        return _json_error(400, error="Invalid payment signature")

    if (order_doc.payment_status or "") == "completed":
        return _json_error(400, error="Payment already verified for this order")

    items_list = json.loads(order_doc.items_json or "[]")
    stock_err = await _decrement_stock_for_order_items(session, items_list)
    if stock_err:
        return stock_err

    order_doc.payment_id = payload.razorpay_payment_id
    order_doc.razorpay_payment_id = payload.razorpay_payment_id
    order_doc.razorpay_signature = payload.razorpay_signature
    order_doc.payment_status = "completed"
    order_doc.status = "confirmed"
    session.add(order_doc)

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Payment verified successfully",
            "data": {
                "orderId": order_doc.order_id,
                "paymentStatus": "completed",
                "orderStatus": "confirmed",
            },
        },
    )


@app.post("/create-order")
async def create_order(payload: CreatePaymentOrderPayload, session: SessionDep) -> JSONResponse:
    try:
        # Debug logging - print incoming request data
        print("=" * 50)
        print("CREATE-ORDER REQUEST DATA:", payload.dict())
        print("=" * 50)
        
        # Get Razorpay credentials from environment
        razor_key_id = settings.get("razorpay_key_id")
        razor_key_secret = settings.get("razorpay_key_secret")
        
        print("RAZORPAY KEYS:", f"KEY_ID: {razor_key_id}", f"SECRET: {'SET' if razor_key_secret else 'NOT SET'}")
        
        if not razor_key_id or not razor_key_secret:
            print("ERROR: Payment service not configured - missing Razorpay keys")
            return JSONResponse(
                status_code=500,
                content={"error": "Payment service not configured - missing Razorpay keys"}
            )

        # Validate cart items if provided
        if payload.items:
            print(f"VALIDATING {len(payload.items)} ITEMS")
            for i, item in enumerate(payload.items):
                product_id = item.get("product_id")
                print(f"ITEM {i+1}: {item}")
                
                if not product_id:
                    print("ERROR: Missing product_id")
                    return _json_error(400, error="Invalid product in order: missing product_id")
                
                # Convert product_id to integer for comparison
                try:
                    product_id_int = int(product_id)
                    print(f"PRODUCT_ID_INT: {product_id_int}")
                except (ValueError, TypeError):
                    print(f"ERROR: Invalid product ID format: {product_id}")
                    return _json_error(400, error=f"Invalid product ID format: {product_id}")
                
                # Check if product exists and is active
                result = await session.execute(
                    select(Product).where(
                        Product.id == product_id_int,
                        Product.active == True
                    )
                )
                product = result.scalar_one_or_none()
                
                if product:
                    print(f"PRODUCT FOUND: {product.name} (ID: {product_id_int}, PRICE: {product.price})")
                else:
                    print(f"ERROR: Product NOT found: {product_id_int}")
                    return _json_error(400, error=f"Invalid product in order: {product_id}")
                
                # Validate price (optional - for security)
                item_price = item.get("price")
                if item_price is not None:
                    try:
                        item_price_float = float(item_price)
                        product_price_float = float(product.price)
                        print(f"PRICE CHECK: Item={item_price_float}, Product={product_price_float}")
                        if abs(item_price_float - product_price_float) > 1.0:  # Allow 1 rupee tolerance
                            print(f"ERROR: Price mismatch for product: {product.name}")
                            return _json_error(400, error=f"Price mismatch for product: {product.name}")
                    except (ValueError, TypeError):
                        print(f"ERROR: Invalid price format for product: {product.name}")
                        return _json_error(400, error=f"Invalid price format for product: {product.name}")

        # Calculate total if not provided
        if payload.amount is None:
            calculated_amount = 0
            if payload.items:
                for item in payload.items:
                    calculated_amount += float(item.get("price", 0)) * int(item.get("quantity", 1))
            
            if payload.shipping:
                calculated_amount += float(payload.shipping)
            if payload.handling:
                calculated_amount += float(payload.handling)
            
            payload.amount = int(calculated_amount * 100)  # Convert to paise
            print(f"CALCULATED AMOUNT: {calculated_amount} -> {payload.amount} paise")

        print(f"FINAL AMOUNT: {payload.amount}")
        print(f"ORDER ID: {payload.orderId}")

        # Initialize Razorpay client with proper error handling
        try:
            from razorpay import Client as RazorpayClient
            rzp = RazorpayClient(auth=(razor_key_id, razor_key_secret))
            print("RAZORPAY CLIENT CREATED SUCCESSFULLY")
        except Exception as e:
            print(f"ERROR: Failed to initialize Razorpay client: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to initialize Razorpay client: {str(e)}"}
            )

        # Create notes with order details
        notes = {
            "orderId": payload.orderId,
            "subtotal": str(payload.subtotal or ""),
            "shipping": str(payload.shipping or ""),
            "handling": str(payload.handling or ""),
            "itemCount": str(len(payload.items)) if payload.items else "0"
        }

        # Ensure amount is in paise (integer)
        amount_in_paise = int(payload.amount) if isinstance(payload.amount, (int, str)) else int(float(payload.amount))
        
        # Create Razorpay order with proper structure
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"receipt_{payload.orderId}",
            "payment_capture": 1,  # Auto-capture payment
            "notes": notes
        }
        
        print("CREATING RAZORPAY ORDER WITH DATA:", order_data)
        
        try:
            razorpay_order = rzp.order.create(order_data)
            print("RAZORPAY ORDER CREATED:", razorpay_order)
        except Exception as e:
            print(f"ERROR: Failed to create Razorpay order: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to create Razorpay order: {str(e)}"}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": {
                    "id": razorpay_order.get("id"),
                    "amount": razorpay_order.get("amount"),
                    "currency": razorpay_order.get("currency"),
                    "orderId": payload.orderId
                }
            }
        )
        
    except Exception as e:
        print("=" * 50)
        print("ERROR IN CREATE-ORDER:", str(e))
        print("ERROR TYPE:", type(e).__name__)
        import traceback
        print("TRACEBACK:")
        traceback.print_exc()
        print("=" * 50)
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to create order: {str(e)}"}
        )


@app.post("/verify-payment")
async def verify_payment(payload: VerifyPaymentPayload) -> JSONResponse:
    try:
        print("=" * 50)
        print("VERIFY-PAYMENT REQUEST DATA:", payload.dict())
        print("=" * 50)
        
        # Get Razorpay secret from environment
        razor_key_secret = settings.get("razorpay_key_secret")
        if not razor_key_secret:
            print("ERROR: Payment service not configured - missing Razorpay secret")
            return JSONResponse(
                status_code=500,
                content={"error": "Payment service not configured - missing Razorpay secret"}
            )
        
        print("RAZORPAY SECRET: SET")
        print(f"PAYMENT ID: {payload.razorpay_payment_id}")
        print(f"ORDER ID: {payload.razorpay_order_id}")
        print(f"SIGNATURE: {payload.razorpay_signature[:20]}...")
        
        # Verify payment signature
        try:
            is_valid = razorpay_signature_matches(
                razor_key_secret,
                order_id=payload.razorpay_order_id,
                payment_id=payload.razorpay_payment_id,
                signature=payload.razorpay_signature,
            )
            print(f"SIGNATURE VALIDATION RESULT: {is_valid}")
        except Exception as e:
            print(f"ERROR: Signature validation failed: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"error": f"Signature validation failed: {str(e)}"}
            )
        
        if not is_valid:
            print("ERROR: Invalid payment signature")
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid payment signature"}
            )
        
        print("PAYMENT VERIFIED SUCCESSFULLY")
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Payment verified successfully",
                "data": {
                    "razorpay_payment_id": payload.razorpay_payment_id,
                    "razorpay_order_id": payload.razorpay_order_id,
                    "orderId": payload.orderId
                }
            }
        )
        
    except Exception as e:
        print("=" * 50)
        print("ERROR IN VERIFY-PAYMENT:", str(e))
        print("ERROR TYPE:", type(e).__name__)
        import traceback
        print("TRACEBACK:")
        traceback.print_exc()
        print("=" * 50)
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to verify payment: {str(e)}"}
        )


@app.post("/api/contact")
async def contact(payload: ContactPayload, session: SessionDep) -> JSONResponse:
    contact_row = Contact(
        name=payload.name,
        email=payload.email.lower(),
        phone=payload.phone,
        subject=payload.subject,
        message=payload.message,
        category=payload.category or "general",
    )
    session.add(contact_row)
    await session.flush()

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Your message has been sent successfully. We will get back to you soon.",
        },
    )


@app.get("/api/admin/products")
async def admin_list_products(request: Request, session: SessionDep) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    q = request.query_params
    page = int(q.get("page", 1))
    limit = int(q.get("limit", 20))
    search = q.get("search")
    category = q.get("category")
    active = q.get("active")

    conds = []
    if search:
        term = f"%{search}%"
        conds.append(
            or_(
                Product.name.ilike(term),
                Product.description.ilike(term),
                Product.category.ilike(term),
            )
        )
    if category:
        conds.append(Product.category == category)
    if active is not None:
        conds.append(Product.active.is_(active.lower() == "true"))

    result = await session.execute(
        select(Product)
        .where(and_(*conds))
        .order_by(Product.created_at.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    products = result.scalars().all()

    total_result = await session.execute(
        select(func.count(Product.id)).where(and_(*conds))
    )
    total = total_result.scalar() or 0

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "products": [product_orm_to_api_dict(p) for p in products],
                "pagination": {
                    "current": page,
                    "pages": int(math.ceil(total / float(limit))) if limit else 1,
                    "total": total,
                },
            },
        },
    )


@app.post("/api/admin/products", status_code=201)
async def admin_create_product(payload: AdminCreateProductPayload, request: Request, session: SessionDep) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    slug = await _unique_product_slug(session, payload.name)
    product = Product(
        name=payload.name,
        slug=slug,
        description=payload.description,
        category=payload.category,
        price=payload.price,
        original_price=payload.originalPrice or payload.price,
        images_json=json.dumps([payload.image] if payload.image else []),
        sizes_json=json.dumps([]),
        colors_json=json.dumps([]),
        size_stock_json=json.dumps({}),
        tags_json=json.dumps([]),
        stock=payload.stock,
        featured=payload.featured,
        active=payload.active,
        rating=0,
        reviews=0,
    )
    session.add(product)
    await session.flush()
    await session.refresh(product)

    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "Product created successfully",
            "data": product_orm_to_api_dict(product),
        },
    )


@app.put("/api/admin/products/{product_id}")
async def admin_update_product(
    product_id: str, payload: AdminUpdateProductPayload, request: Request, session: SessionDep
) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    pid = safe_int_id(product_id)
    if pid is None:
        return _json_error(400, message="Invalid product ID")

    result = await session.execute(select(Product).where(Product.id == pid))
    p = result.scalar_one_or_none()
    if not p:
        return _json_error(404, message="Product not found")

    if payload.name is not None:
        p.name = payload.name
        p.slug = await _unique_product_slug(session, payload.name, exclude_product_id=pid)
    if payload.description is not None:
        p.description = payload.description
    if payload.category is not None:
        p.category = payload.category
    if payload.price is not None:
        p.price = payload.price
    if payload.originalPrice is not None:
        p.original_price = payload.originalPrice
    if payload.image is not None:
        p.images_json = json.dumps([payload.image])
    if payload.stock is not None:
        if payload.stock < 0:
            return _json_error(400, message="Stock cannot be negative")
        p.stock = payload.stock
    if payload.featured is not None:
        p.featured = payload.featured
    if payload.active is not None:
        p.active = payload.active
    session.add(p)

    return JSONResponse(
        status_code=200,
        content={"success": True, "data": product_orm_to_api_dict(p)},
    )


@app.delete("/api/admin/products/{product_id}")
async def admin_delete_product(
    product_id: str, request: Request, session: SessionDep
) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    pid = safe_int_id(product_id)
    if pid is None:
        return _json_error(400, message="Invalid product ID")

    result = await session.execute(select(Product).where(Product.id == pid))
    p = result.scalar_one_or_none()
    if not p:
        return _json_error(404, message="Product not found")

    await session.delete(p)

    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "Product deleted successfully"},
    )


@app.get("/api/admin/orders")
async def admin_list_orders(request: Request, session: SessionDep) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    q = request.query_params
    page = int(q.get("page", 1))
    limit = int(q.get("limit", 20))
    status = q.get("status")
    search = q.get("search")

    conds = []
    if status:
        conds.append(Order.status == status)
    if search:
        term = f"%{search}%"
        conds.append(
            or_(
                Order.order_id.ilike(term),
                Order.shipping_json.ilike(term),
            )
        )

    result = await session.execute(
        select(Order)
        .where(and_(*conds))
        .order_by(Order.created_at.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    orders = result.scalars().all()

    total_result = await session.execute(
        select(func.count(Order.id)).where(and_(*conds))
    )
    total = total_result.scalar() or 0

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "orders": [order_orm_to_api_dict(o) for o in orders],
                "pagination": {
                    "current": page,
                    "pages": int(math.ceil(total / float(limit))) if limit else 1,
                    "total": total,
                },
            },
        },
    )


@app.get("/api/admin/customers")
async def admin_customers(request: Request, session: SessionDep) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    q = request.query_params
    page = int(q.get("page", 1))
    limit = int(q.get("limit", 20))
    search = q.get("search")

    conds = []
    if search:
        term = f"%{search}%"
        conds.append(
            or_(
                User.first_name.ilike(term),
                User.last_name.ilike(term),
                User.email.ilike(term),
                User.phone.ilike(term),
            )
        )

    result = await session.execute(
        select(User)
        .where(and_(*conds))
        .order_by(User.created_at.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    users = result.scalars().all()

    total_result = await session.execute(
        select(func.count(User.id)).where(and_(*conds))
    )
    total = total_result.scalar() or 0

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "customers": [user_orm_to_api_dict(u) for u in users],
                "pagination": {
                    "current": page,
                    "pages": int(math.ceil(total / float(limit))) if limit else 1,
                    "total": total,
                },
            },
        },
    )


@app.post("/api/admin/upload-image")
async def admin_upload_image(request: Request, session: SessionDep, image: UploadFile = File(...)) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    ext = _safe_upload_extension(image.filename or "", image.content_type or "")
    if not ext:
        return _json_error(400, message="Invalid image format. Only JPG, PNG, and WebP are allowed.")

    filename = f"{secrets.token_urlsafe(16)}{ext}"
    file_path = Path(UPLOAD_DIR) / filename

    try:
        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)
    except Exception as exc:
        logging.getLogger("app").exception("Failed to save uploaded image")
        return _json_error(500, message="Failed to save image")

    image_url = f"/uploads/{filename}"
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"url": image_url}},
    )


@app.get("/api/admin/contacts")
async def admin_contacts(request: Request, session: SessionDep) -> JSONResponse:
    user_doc, err = await _get_authenticated_user(request, session)
    if err:
        return err
    admin_err = _require_admin(user_doc)
    if admin_err:
        return admin_err

    q = request.query_params
    page = int(q.get("page", 1))
    limit = int(q.get("limit", 20))
    category = q.get("category")

    conds = []
    if category:
        conds.append(Contact.category == category)

    result = await session.execute(
        select(Contact)
        .where(and_(*conds))
        .order_by(Contact.created_at.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    contacts = result.scalars().all()

    total_result = await session.execute(
        select(func.count(Contact.id)).where(and_(*conds))
    )
    total = total_result.scalar() or 0

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "contacts": [
                    {
                        "_id": c.id,
                        "name": c.name,
                        "email": c.email,
                        "phone": c.phone,
                        "subject": c.subject,
                        "message": c.message,
                        "category": c.category,
                        "createdAt": c.created_at,
                    }
                    for c in contacts
                ],
                "pagination": {
                    "current": page,
                    "pages": int(math.ceil(total / float(limit))) if limit else 1,
                    "total": total,
                },
            },
        },
    )


# --- Production UI (Vite build output: frontend `npm run build` → backend/frontend_dist) ---
# Assets are mounted explicitly; HTML routes use _spa_fallback_on_404 middleware + catch-all below.
if _FRONTEND_DIST.is_dir():
    _assets_dir = _FRONTEND_DIST / "assets"
    _images_dir = _FRONTEND_DIST / "images"
    if _assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="spa_assets")
    if _images_dir.is_dir():
        app.mount("/images", StaticFiles(directory=str(_images_dir)), name="spa_images")

    _logo_png = _FRONTEND_DIST / "images" / "logo.png"
    if _logo_png.is_file():
        @app.get("/logo.png", include_in_schema=False)
        async def logo():
            return FileResponse(_logo_png)

    _index_html = _FRONTEND_DIST / "index.html"
    if _index_html.is_file():
        @app.get("/", include_in_schema=False)
        @app.get("/admin", include_in_schema=False)
        @app.get("/admin/{path:path}", include_in_schema=False)
        @app.get("/shop", include_in_schema=False)
        @app.get("/shop/{path:path}", include_in_schema=False)
        @app.get("/t-shirts", include_in_schema=False)
        @app.get("/t-shirts/{path:path}", include_in_schema=False)
        @app.get("/casual-wears", include_in_schema=False)
        @app.get("/casual-wears/{path:path}", include_in_schema=False)
        @app.get("/cart", include_in_schema=False)
        @app.get("/checkout", include_in_schema=False)
        @app.get("/payment", include_in_schema=False)
        @app.get("/profile", include_in_schema=False)
        @app.get("/contact", include_in_schema=False)
        @app.get("/returns", include_in_schema=False)
        @app.get("/privacy", include_in_schema=False)
        @app.get("/terms", include_in_schema=False)
        @app.get("/refund", include_in_schema=False)
        @app.get("/shipping", include_in_schema=False)
        @app.get("/about", include_in_schema=False)
        @app.get("/faq", include_in_schema=False)
        @app.get("/order-success", include_in_schema=False)
        @app.get("/order-failed", include_in_schema=False)
        @app.get("/{path:path}", include_in_schema=False)
        async def spa_fallback():
            return FileResponse(_index_html)




if __name__ == "__main__":
    import uvicorn

    _port = int(os.getenv("PORT", str(settings.get("port", 5000))))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=_port,
        log_level="debug",
        access_log=True,
        use_colors=True,
    )
