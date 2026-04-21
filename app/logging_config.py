"""Terminal logging: root + uvicorn + Starlette + optional SQL; request/response lines."""

import logging
import os
import sys
import time
from typing import Any, Dict, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


def configure_logging(settings: Optional[Dict[str, Any]] = None) -> None:
    settings = settings or {}
    level_name = (os.getenv("LOG_LEVEL") or settings.get("log_level") or "DEBUG").upper()
    level = getattr(logging, level_name, logging.DEBUG)

    fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    datefmt = "%Y-%m-%d %H:%M:%S"
    bc: Dict[str, Any] = {
        "level": level,
        "format": fmt,
        "datefmt": datefmt,
        "stream": sys.stdout,
    }
    if sys.version_info >= (3, 8):
        bc["force"] = True
    logging.basicConfig(**bc)

    for name in (
        "uvicorn",
        "uvicorn.access",
        "uvicorn.error",
        "uvicorn.asgi",
        "fastapi",
        "starlette",
        "multipart",
    ):
        logging.getLogger(name).setLevel(level)

    sql_echo = bool(settings.get("sql_echo")) or os.getenv("SQL_ECHO", "").lower() in ("1", "true", "yes")
    sql_engine = logging.getLogger("sqlalchemy.engine")
    if sql_echo:
        sql_engine.setLevel(logging.INFO)
    else:
        sql_engine.setLevel(logging.WARNING)


class RequestResponseLoggingMiddleware(BaseHTTPMiddleware):
    """log: method path -> status duration_ms (and errors)."""

    async def dispatch(self, request: Request, call_next):
        log = logging.getLogger("app.http")
        path = request.url.path
        start = time.perf_counter()
        log.debug("→ %s %s", request.method, path)
        try:
            response = await call_next(request)
        except Exception:
            log.exception("FAIL %s %s (unhandled)", request.method, path)
            raise
        ms = (time.perf_counter() - start) * 1000
        log.info("← %s %s %s %.2fms", request.method, path, getattr(response, "status_code", "?"), ms)
        return response
