#!/usr/bin/env python3
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import get_settings
from app.main import Product
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

async def check_product_price():
    settings = get_settings()
    sqlite_url = settings.get("sqlite_url")
    if not sqlite_url:
        sqlite_url = f"sqlite+aiosqlite:///{settings['sqlite_path']}"
    engine = create_async_engine(sqlite_url)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        from sqlalchemy import select
        
        # Get product with ID 1
        result = await session.execute(
            select(Product).where(Product.id == 1)
        )
        product = result.scalar_one_or_none()
        
        if product:
            print(f"Product ID: {product.id}")
            print(f"Product Name: {product.name}")
            print(f"Product Price: {product.price}")
            print(f"Product Active: {product.active}")
        else:
            print("Product with ID 1 not found")

if __name__ == "__main__":
    asyncio.run(check_product_price())
