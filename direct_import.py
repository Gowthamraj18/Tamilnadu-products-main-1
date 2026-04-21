#!/usr/bin/env python3
"""
Direct import of all products from frontend data
"""

import asyncio
import sys
from pathlib import Path

# Add to app directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.database import configure_engine, init_db, get_session
from app.config import get_settings
from app.db.models import Product

# Direct product data from frontend analysis
PRODUCTS_DATA = [
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
        'name': 'THE COOL TEE',
        'slug': 'the-cool-tee',
        'description': 'T-Shirt Half Sleeve featuring trendy Cool Tee design. Premium quality white t-shirt with 106 CM chest size, made from 100% cotton fabric. Contemporary style that embodies modern fashion with clean, minimalist aesthetic.',
        'category': 't-shirts',
        'price': 1299.0,
        'original_price': 1599.0,
        'images_json': '["/images/t-shirts/THE COOL TEE L.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["White"]',
        'stock': 22,
        'size_stock_json': '{"L": 22}',
        'rating': 4.4,
        'reviews': 14,
        'featured': False,
        'tags_json': '["cool-tee", "white", "trendy", "contemporary", "stylish"]',
        'active': True
    },
    {
        'name': 'MODA RAPIDO',
        'slug': 'moda-rapido',
        'description': 'T-Shirt Half Sleeve featuring fashion-forward Moda Rapido design. Premium quality blue t-shirt with 106 CM chest size, made from 100% cotton fabric. Cutting-edge style that embodies latest fashion trends with contemporary aesthetics.',
        'category': 'casual-wear',
        'price': 1299.0,
        'original_price': 1599.0,
        'images_json': '["/images/casual-wear/MODA RAPIDO L.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Blue"]',
        'stock': 20,
        'size_stock_json': '{"L": 20}',
        'rating': 4.6,
        'reviews': 18,
        'featured': False,
        'tags_json': '["moda-rapido", "blue", "fashion-forward", "cutting-edge", "trendy"]',
        'active': True
    },
    {
        'name': 'ABOF',
        'slug': 'abof',
        'description': 'T-Shirt Half Sleeve featuring modern ABOF design. Premium quality light orange t-shirt with 102 CM chest size, made from 100% cotton fabric. Vibrant color and contemporary style perfect for fashion-conscious individuals.',
        'category': 'casual-wear',
        'price': 399.0,
        'original_price': 599.0,
        'images_json': '["/images/casual-wear/ABOF M.jpeg"]',
        'sizes_json': '["M"]',
        'colors_json': '["Light Orange"]',
        'stock': 32,
        'size_stock_json': '{"M": 32}',
        'rating': 4.5,
        'reviews': 16,
        'featured': False,
        'tags_json': '["abof", "light-orange", "modern", "vibrant", "contemporary"]',
        'active': True
    },
    {
        'name': 'ORIGINALS NAVY BLUE',
        'slug': 'originals-navy-blue',
        'description': 'T-Shirt Half Sleeve featuring timeless Originals design. Premium quality navy blue t-shirt with 102 CM chest size, made from 100% cotton fabric. Classic style that embodies Originals commitment to quality and timeless fashion.',
        'category': 'casual-wear',
        'price': 1199.0,
        'original_price': 1499.0,
        'images_json': '["/images/casual-wear/Originals S White.jpeg"]',
        'sizes_json': '["M"]',
        'colors_json': '["Navy Blue"]',
        'stock': 25,
        'size_stock_json': '{"M": 25}',
        'rating': 4.4,
        'reviews': 15,
        'featured': False,
        'tags_json': '["originals", "navy-blue", "classic", "timeless", "premium"]',
        'active': True
    },
    {
        'name': 'ORIGINALS WHITE',
        'slug': 'originals-white',
        'description': 'T-Shirt Half Sleeve featuring clean Originals design. Premium quality white t-shirt with 96 CM chest size, made from 100% cotton fabric. Crisp, minimalist style that embodies Originals philosophy of simplicity and sophistication.',
        'category': 'casual-wear',
        'price': 1199.0,
        'original_price': 1499.0,
        'images_json': '["/images/casual-wear/Originals S White.jpeg"]',
        'sizes_json': '["S"]',
        'colors_json': '["White"]',
        'stock': 25,
        'size_stock_json': '{"S": 25}',
        'rating': 4.5,
        'reviews': 18,
        'featured': False,
        'tags_json': '["originals", "white", "minimalist", "clean", "classic"]',
        'active': True
    },
    {
        'name': 'ORIGINALS MUSTARD',
        'slug': 'originals-mustard',
        'description': 'T-Shirt Half Sleeve featuring warm Originals design. Premium quality mustard t-shirt with 96 CM chest size, made from 100% cotton fabric. Rich color that combines Originals heritage with contemporary fashion sensibilities.',
        'category': 'casual-wear',
        'price': 1199.0,
        'original_price': 1499.0,
        'images_json': '["/images/casual-wear/ORIGINALS S MUSTARD.jpeg"]',
        'sizes_json': '["S"]',
        'colors_json': '["Mustard"]',
        'stock': 20,
        'size_stock_json': '{"S": 20}',
        'rating': 4.3,
        'reviews': 11,
        'featured': False,
        'tags_json': '["originals", "mustard", "warm", "contemporary", "heritage"]',
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
    },
    {
        'name': 'FLYING MACHINE GREEN',
        'slug': 'flying-machine-green',
        'description': 'T-Shirt Half Sleeve featuring stylish Flying Machine design. Premium quality green t-shirt with 106 CM chest size, made from 100% cotton fabric. Contemporary design with exceptional durability and comfort for everyday wear.',
        'category': 't-shirts',
        'price': 999.0,
        'original_price': 1299.0,
        'images_json': '["/images/t-shirts/FLYING MACHINE L GREEN.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Green"]',
        'stock': 30,
        'size_stock_json': '{"L": 30}',
        'rating': 4.4,
        'reviews': 27,
        'featured': True,
        'tags_json': '["flying-machine", "green", "modern", "durable", "contemporary"]',
        'active': True
    },
    {
        'name': 'SPUNK NAVY BLUE',
        'slug': 'spunk-navy-blue',
        'description': 'T-Shirt Half Sleeve featuring bold SPUNK design. Premium quality navy blue t-shirt with 96 CM chest size, made from 100% cotton fabric. Deep navy color that provides sophisticated look with youthful energy.',
        'category': 't-shirts',
        'price': 299.0,
        'original_price': 499.0,
        'images_json': '["/images/t-shirts/SPUNK M NAVY BLUE.jpeg"]',
        'sizes_json': '["M"]',
        'colors_json': '["Navy Blue"]',
        'stock': 24,
        'size_stock_json': '{"M": 24}',
        'rating': 4.3,
        'reviews': 13,
        'featured': False,
        'tags_json': '["spunk", "navy-blue", "bold", "youthful", "energetic"]',
        'active': True
    },
    {
        'name': 'SPUNK BLACK',
        'slug': 'spunk-black',
        'description': 'T-Shirt Half Sleeve featuring edgy SPUNK design. Premium quality black t-shirt with 96 CM chest size, made from 100% cotton fabric. Modern black t-shirt that combines SPUNK\'s commitment to contemporary fashion with exceptional comfort.',
        'category': 't-shirts',
        'price': 299.0,
        'original_price': 499.0,
        'images_json': '["/images/t-shirts/SPUNK S BLACK.jpeg"]',
        'sizes_json': '["S"]',
        'colors_json': '["Black"]',
        'stock': 20,
        'size_stock_json': '{"S": 20}',
        'rating': 4.4,
        'reviews': 16,
        'featured': False,
        'tags_json': '["spunk", "black", "edgy", "modern", "stylish"]',
        'active': True
    },
    {
        'name': 'Cactus Man',
        'slug': 'cactus-man-cream-beige',
        'description': 'T-Shirt Half Sleeve featuring unique Cactus Man design. Premium quality cream-beige t-shirt with 106 CM chest size, made from 100% cotton fabric. Distinctive cream-beige color that appeals to fans of the brand with its subtle, sophisticated tone.',
        'category': 'casual-wear',
        'price': 1199.0,
        'original_price': 1499.0,
        'images_json': '["/images/casual-wear/CACTUS MAN L WI.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Cream-Beige"]',
        'stock': 22,
        'size_stock_json': '{"L": 22}',
        'rating': 4.5,
        'reviews': 14,
        'featured': True,
        'tags_json': '["cactus-man", "cream-beige", "unique", "distinctive", "sophisticated"]',
        'active': True
    },
    {
        'name': 'DJ&C MAROON',
        'slug': 'djc-maroon',
        'description': 'T-Shirt Half Sleeve featuring rich DJ&C design. Premium quality maroon t-shirt with 106 CM chest size, made from 100% cotton fabric. Deep maroon color that provides confident, energetic look for various occasions.',
        'category': 'casual-wear',
        'price': 899.0,
        'original_price': 1099.0,
        'images_json': '["/images/casual-wear/DJ&C L MARON.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Maroon"]',
        'stock': 18,
        'size_stock_json': '{"L": 18}',
        'rating': 4.4,
        'reviews': 12,
        'featured': False,
        'tags_json': '["djc", "maroon", "rich", "confident", "energetic"]',
        'active': True
    },
    {
        'name': 'DJ&C WHITE',
        'slug': 'djc-white',
        'description': 'T-Shirt Half Sleeve featuring elegant DJ&C design. Premium quality white t-shirt with 102 CM chest size, made from 100% cotton fabric. Clean, sophisticated white that provides versatile styling for any occasion.',
        'category': 'casual-wear',
        'price': 899.0,
        'original_price': 1099.0,
        'images_json': '["/images/casual-wear/DJ&C M WHITE 1.jpeg"]',
        'sizes_json': '["M", "L"]',
        'colors_json': '["White"]',
        'stock': 35,
        'size_stock_json': '{"M": 35, "L": 28}',
        'rating': 4.3,
        'reviews': 22,
        'featured': True,
        'tags_json': '["djc", "white", "elegant", "minimalist", "versatile"]',
        'active': True
    },
    {
        'name': 'H&M GREEN',
        'slug': 'hm-green-xl',
        'description': 'T-Shirt Half Sleeve featuring modern H&M design. Premium quality green t-shirt with 112 CM chest size, made from 100% cotton fabric. Contemporary green color that provides fresh, vibrant look for style-conscious individuals.',
        'category': 't-shirts',
        'price': 499.0,
        'original_price': 699.0,
        'images_json': '["/images/t-shirts/H&M Man Green.jpeg"]',
        'sizes_json': '["XL"]',
        'colors_json': '["Green"]',
        'stock': 25,
        'size_stock_json': '{"XL": 25}',
        'rating': 4.3,
        'reviews': 15,
        'featured': True,
        'tags_json': '["hm", "green", "modern", "vibrant", "fresh"]',
        'active': True
    },
    {
        'name': 'H&M GREEN L',
        'slug': 'hm-green-l',
        'description': 'T-Shirt Half Sleeve featuring modern H&M design. Premium quality green t-shirt with 106 CM chest size, made from 100% cotton fabric. Classic green color that combines H&M\'s signature style with timeless appeal.',
        'category': 't-shirts',
        'price': 499.0,
        'original_price': 699.0,
        'images_json': '["/images/t-shirts/H&M Man Green.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Green"]',
        'stock': 20,
        'size_stock_json': '{"L": 20}',
        'rating': 4.3,
        'reviews': 15,
        'featured': True,
        'tags_json': '["hm", "green", "modern", "classic", "versatile"]',
        'active': True
    },
    {
        'name': 'H&M GREEN M',
        'slug': 'hm-green-m',
        'description': 'T-Shirt Half Sleeve featuring modern H&M design. Premium quality green t-shirt with 102 CM chest size, made from 100% cotton fabric. Versatile green that provides comfortable fit with H&M\'s commitment to quality and style.',
        'category': 't-shirts',
        'price': 499.0,
        'original_price': 699.0,
        'images_json': '["/images/t-shirts/H&M Man Green.jpeg"]',
        'sizes_json': '["M"]',
        'colors_json': '["Green"]',
        'stock': 25,
        'size_stock_json': '{"M": 25}',
        'rating': 4.3,
        'reviews': 15,
        'featured': True,
        'tags_json': '["hm", "green", "versatile", "comfortable", "quality"]',
        'active': True
    },
    {
        'name': 'Max',
        'slug': 'max-white',
        'description': 'T-Shirt Half Sleeve featuring clean Max design. Premium quality white t-shirt with 106 CM chest size, made from 100% cotton fabric. Crisp white color that embodies Max commitment to simplicity and style.',
        'category': 't-shirts',
        'price': 199.0,
        'original_price': 299.0,
        'images_json': '["/images/t-shirts/Max White L.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["White"]',
        'stock': 30,
        'size_stock_json': '{"L": 30}',
        'rating': 4.4,
        'reviews': 17,
        'featured': False,
        'tags_json': '["max", "white", "clean", "minimalist", "classic"]',
        'active': True
    },
    {
        'name': 'NOBERO BLACK 2XL',
        'slug': 'nobero-black-2xl',
        'description': 'T-Shirt Half Sleeve featuring bold NOBERO design. Premium quality black t-shirt with 116 CM chest size, made from 100% cotton fabric. Confident black color that provides powerful look with NOBERO commitment to modern style.',
        'category': 't-shirts',
        'price': 1199.0,
        'original_price': 1499.0,
        'images_json': '["/images/t-shirts/NOBERO BLACK 2XL.jpeg"]',
        'sizes_json': '["2XL"]',
        'colors_json': '["Black"]',
        'stock': 15,
        'size_stock_json': '{"2XL": 15}',
        'rating': 4.5,
        'reviews': 14,
        'featured': False,
        'tags_json': '["nobero", "black", "bold", "powerful", "modern"]',
        'active': True
    },
    {
        'name': 'NOBERO GRAY',
        'slug': 'nobero-gray',
        'description': 'T-Shirt Half Sleeve featuring sophisticated NOBERO design. Premium quality gray t-shirt with 102 CM chest size, made from 100% cotton fabric. Versatile gray that provides timeless style with NOBERO commitment to quality.',
        'category': 't-shirts',
        'price': 1199.0,
        'original_price': 1499.0,
        'images_json': '["/images/t-shirts/NOBERO GRAY M.jpeg"]',
        'sizes_json': '["M"]',
        'colors_json': '["Gray"]',
        'stock': 32,
        'size_stock_json': '{"M": 32}',
        'rating': 4.4,
        'reviews': 15,
        'featured': False,
        'tags_json': '["nobero", "gray", "sophisticated", "versatile", "timeless"]',
        'active': True
    },
    {
        'name': 'NOBERO GREEN',
        'slug': 'nobero-green',
        'description': 'T-Shirt Half Sleeve featuring fresh NOBERO design. Premium quality green t-shirt with 102 CM chest size, made from 100% cotton fabric. Natural green that provides vibrant, energetic look with NOBERO style.',
        'category': 't-shirts',
        'price': 1199.0,
        'original_price': 1499.0,
        'images_json': '["/images/t-shirts/NOBERO GREEN L.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Green"]',
        'stock': 24,
        'size_stock_json': '{"L": 24}',
        'rating': 4.3,
        'reviews': 13,
        'featured': False,
        'tags_json': '["nobero", "green", "fresh", "vibrant", "natural"]',
        'active': True
    },
    {
        'name': 'NOBERO MULTI GREEN',
        'slug': 'nobero-multi-green',
        'description': 'T-Shirt Half Sleeve featuring artistic NOBERO design. Premium quality multi-green t-shirt with 102 CM chest size, made from 100% cotton fabric. Creative multi-tone green pattern that showcases NOBERO innovative approach to style.',
        'category': 't-shirts',
        'price': 1199.0,
        'original_price': 1499.0,
        'images_json': '["/images/t-shirts/NOBERO MULTI GREEN L.jpeg"]',
        'sizes_json': '["L"]',
        'colors_json': '["Multi Green"]',
        'stock': 18,
        'size_stock_json': '{"L": 18}',
        'rating': 4.5,
        'reviews': 14,
        'featured': False,
        'tags_json': '["nobero", "multi-green", "artistic", "creative", "innovative"]',
        'active': True
    },
    {
        'name': 'Polo Club',
        'slug': 'polo-club-black',
        'description': 'T-Shirt Half Sleeve featuring classic Polo Club design. Premium quality black t-shirt with 102 CM chest size, made from 100% cotton fabric. Traditional polo style that embodies Polo Club heritage with timeless black color.',
        'category': 't-shirts',
        'price': 499.0,
        'original_price': 699.0,
        'images_json': '["/images/t-shirts/Polo Club Black.jpeg"]',
        'sizes_json': '["M"]',
        'colors_json': '["Black"]',
        'stock': 25,
        'size_stock_json': '{"M": 25}',
        'rating': 4.6,
        'reviews': 12,
        'featured': False,
        'tags_json': '["polo-club", "black", "classic", "traditional", "timeless"]',
        'active': True
    }
]

async def import_all_products():
    """Import ALL products into database"""
    print("Starting complete product import...")
    
    # Configure database
    settings = get_settings()
    configure_engine(settings)
    await init_db()
    
    # Clear existing products first
    print("Clearing existing products...")
    async for session in get_session():
        from sqlalchemy import delete
        
        # Delete all existing products
        await session.execute(delete(Product))
        await session.commit()
        break
    
    # Import all products
    imported_count = 0
    skipped_count = 0
    
    async for session in get_session():
        from sqlalchemy import select
        
        for i, product_data in enumerate(PRODUCTS_DATA, 1):
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
    print(f"Total processed: {imported_count + skipped_count} products")
    
    # Show category breakdown
    categories = {}
    for product in PRODUCTS_DATA:
        category = product.get('category', 'unknown')
        categories[category] = categories.get(category, 0) + 1
    
    print(f"\nCategory breakdown:")
    for category, count in categories.items():
        print(f"  {category}: {count} products")

if __name__ == "__main__":
    asyncio.run(import_all_products())
