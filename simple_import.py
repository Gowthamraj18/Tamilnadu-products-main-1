#!/usr/bin/env python3
"""
Simple script to manually define and import products
"""

import asyncio
import sys
from pathlib import Path

# Add to app directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.database import configure_engine, init_db, get_session
from app.config import get_settings
from app.db.models import Product

# Sample products data (manually extracted from frontend)
SAMPLE_PRODUCTS = [
    {
        'name': 'THE ADDAMS FAMILY',
        'slug': 'the-addams-family',
        'description': 'T-Shirt Half Sleeve featuring iconic Addams Family design. Premium quality black t-shirt with 106 CM chest size, made from 100% cotton fabric. Classic gothic style perfect for fans who appreciate dark humor and timeless entertainment.',
        'category': 't-shirts',
        'price': 499.0,
        'original_price': 799.0,
        'images_json': '["/images/t-shirts/THE ADDAMS FAMILY.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Black"]',
        'stock': 25,
        'size_stock_json': '{"L": 25}',
        'rating': 4.6,
        'reviews': 22,
        'featured': False,
        'tags_json': '["addams-family", "black", "gothic", "licensed", "iconic"]',
        'active': True
    },
    {
        'name': 'PERRY ELLIS',
        'slug': 'perry-ellis',
        'description': 'T-Shirt Half Sleeve featuring sophisticated Perry Ellis design. Premium quality grey t-shirt with 106 CM chest size, made from 100% cotton fabric. Elegant casual shirt perfect for discerning gentlemen who appreciate refined style and quality.',
        'category': 'casual-wear',
        'price': 299.0,
        'original_price': 499.0,
        'images_json': '["/images/casual-wear/PERRY ELLIS.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Grey"]',
        'stock': 15,
        'size_stock_json': '{"L": 15}',
        'rating': 4.7,
        'reviews': 20,
        'featured': True,
        'tags_json': '["perry-ellis", "grey", "sophisticated", "premium", "elegant"]',
        'active': True
    },
    {
        'name': 'MEN TSHIRT',
        'slug': 'men-tshirt-black',
        'description': 'T-Shirt Half Sleeve featuring classic men\'s design. Premium quality black t-shirt with 96 CM chest size, made from 100% cotton fabric. Essential basic t-shirt perfect for everyday wear with timeless style.',
        'category': 't-shirts',
        'price': 499.0,
        'original_price': 699.0,
        'images_json': '["/images/t-shirts/SPUNK S BLACK.jpeg"]',
        'sizes_json': '["S"]',
        'colors_json': '["Black"]',
        'stock': 30,
        'size_stock_json': '{"S": 30}',
        'rating': 4.2,
        'reviews': 18,
        'featured': True,
        'tags_json': '["men-tshirt", "black", "classic", "basic", "essential"]',
        'active': True
    },
    {
        'name': 'ONE GLOB',
        'slug': 'one-glob',
        'description': 'T-Shirt Half Sleeve featuring unique One Glob design. Premium quality red t-shirt with 106 CM chest size, made from 100% cotton fabric. Distinctive aesthetic that sets you apart from the crowd with innovative style.',
        'category': 't-shirts',
        'price': 499.0,
        'original_price': 799.0,
        'images_json': '["/images/t-shirts/ONE GLOB.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Red"]',
        'stock': 25,
        'size_stock_json': '{"L": 25}',
        'rating': 4.5,
        'reviews': 14,
        'featured': False,
        'tags_json': '["one-glob", "red", "unique", "innovative", "modern"]',
        'active': True
    },
    {
        'name': 'MARVEL BLACK',
        'slug': 'marvel-black',
        'description': 'T-Shirt Half Sleeve featuring iconic Marvel design. Premium quality black t-shirt with 96 CM chest size, made from 100% cotton fabric. Authentic Marvel licensed product with superior comfort and lasting durability.',
        'category': 't-shirts',
        'price': 399.0,
        'original_price': 499.0,
        'images_json': '["/images/t-shirts/MARVEL MAX S BLACK PANTHER.jpeg"]',
        'sizes_json': '["S"]',
        'colors_json': '["Black"]',
        'stock': 20,
        'size_stock_json': '{"S": 20}',
        'rating': 4.4,
        'reviews': 16,
        'featured': True,
        'tags_json': '["marvel", "black", "licensed", "iconic", "superhero"]',
        'active': True
    },
    {
        'name': 'MARVEL WHITE',
        'slug': 'marvel-white',
        'description': 'T-Shirt Half Sleeve featuring classic Marvel design. Premium quality white t-shirt with 102 CM chest size, made from 100% cotton fabric. Clean Marvel licensed product that offers versatility and timeless superhero style.',
        'category': 't-shirts',
        'price': 399.0,
        'original_price': 499.0,
        'images_json': '["/images/t-shirts/MARVEL M WHITE.jpeg"]',
        'sizes_json': '["M"]',
        'colors_json': '["White"]',
        'stock': 25,
        'size_stock_json': '{"M": 25}',
        'rating': 4.4,
        'reviews': 18,
        'featured': True,
        'tags_json': '["marvel", "white", "licensed", "classic", "clean"]',
        'active': True
    }
]

async def import_products():
    """Import sample products into database"""
    print("Starting product import...")
    
    # Configure database
    settings = get_settings()
    configure_engine(settings)
    await init_db()
    
    # Import products
    imported_count = 0
    skipped_count = 0
    
    async for session in get_session():
        from sqlalchemy import select
        
        for i, product_data in enumerate(SAMPLE_PRODUCTS, 1):
            try:
                # Check if product already exists
                existing_result = await session.execute(
                    select(Product).where(Product.slug == product_data['slug'])
                )
                existing = existing_result.scalar_one_or_none()
                
                if existing:
                    print(f"Skipping product {i}: {product_data['name']} (already exists)")
                    skipped_count += 1
                    continue
                
                # Create product
                product = Product(**product_data)
                session.add(product)
                await session.flush()
                
                print(f"Imported product {i}: {product_data['name']} ({product_data['category']})")
                imported_count += 1
                
            except Exception as e:
                print(f"Error importing product {product_data.get('name')}: {e}")
                continue
        
        await session.commit()
        break
    
    print(f"\nImport complete!")
    print(f"Successfully imported: {imported_count} products")
    print(f"Skipped (already exists): {skipped_count} products")

if __name__ == "__main__":
    asyncio.run(import_products())
