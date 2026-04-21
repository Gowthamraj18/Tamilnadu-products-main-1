#!/usr/bin/env python3
"""
Script to import products from frontend data into backend database
"""

import asyncio
import json
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.database import configure_engine, init_db, get_session
from app.config import get_settings
from app.db.models import Product

def load_frontend_products():
    """Load products from frontend data file"""
    frontend_data_path = Path(__file__).parent / "frontend" / "src" / "data" / "products.js"
    
    if not frontend_data_path.exists():
        print(f"Error: Frontend products file not found at {frontend_data_path}")
        return []
    
    try:
        with open(frontend_data_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find the start of the array
            start = content.find('export const AKL_PRODUCTS = [')
            if start == -1:
                print("Error: Could not find AKL_PRODUCTS array in JavaScript file")
                return []
            
            # Find the end of the array
            start = start + len('export const AKL_PRODUCTS = [')
            bracket_count = 0
            end = start
            
            for i, char in enumerate(content[start:], start):
                if char == '[':
                    bracket_count += 1
                elif char == ']':
                    bracket_count -= 1
                    if bracket_count == 0:
                        end = i + 1
                        break
            
            if end <= start:
                print("Error: Could not find end of product array")
                return []
            
            json_str = content[start:end]
            products_data = json.loads(json_str)
            print(f"Loaded {len(products_data)} products from frontend data")
            return products_data
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print("Attempting to fix common JSON issues...")
        # Try to fix trailing commas and other common issues
        try:
            with open(frontend_data_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Find the array start and end
            array_lines = []
            in_array = False
            for line in lines:
                if 'export const AKL_PRODUCTS = [' in line:
                    in_array = True
                    continue
                elif in_array and line.strip() == '];':
                    break
                elif in_array:
                    array_lines.append(line)
            
            json_str = '\n'.join(array_lines)
            products_data = json.loads(json_str)
            print(f"Successfully loaded {len(products_data)} products from frontend data")
            return products_data
        except Exception as e2:
            print(f"Second attempt failed: {e2}")
            return []
    except Exception as e:
        print(f"Error loading frontend products: {e}")
        return []

def convert_frontend_to_db(frontend_product):
    """Convert frontend product format to database model format"""
    return {
        'name': frontend_product.get('name', ''),
        'slug': frontend_product.get('_id', ''),
        'description': frontend_product.get('description', ''),
        'short_description': frontend_product.get('description', '')[:200] + '...' if len(frontend_product.get('description', '')) > 200 else frontend_product.get('description', ''),
        'category': frontend_product.get('category', ''),
        'price': float(frontend_product.get('price', 0)),
        'original_price': float(frontend_product.get('originalPrice', 0)) if frontend_product.get('originalPrice') else None,
        'images_json': json.dumps(frontend_product.get('images', [])),
        'sizes_json': json.dumps(frontend_product.get('sizes', [])),
        'colors_json': json.dumps(frontend_product.get('colors', [])),
        'stock': int(frontend_product.get('stock', {}).get(list(frontend_product.get('stock', {}).keys())[0], 0) if frontend_product.get('stock') else 0),
        'size_stock_json': json.dumps(frontend_product.get('stock', {})),
        'rating': float(frontend_product.get('rating', 0)),
        'reviews': int(frontend_product.get('reviews', 0)),
        'tags_json': json.dumps(frontend_product.get('tags', [])),
        'featured': bool(frontend_product.get('featured', False)),
        'active': True,
        'seo_json': json.dumps({
            'title': frontend_product.get('name', ''),
            'description': frontend_product.get('description', ''),
            'keywords': ', '.join(frontend_product.get('tags', []))
        }),
        'specifications_json': json.dumps(frontend_product.get('details', {}))
    }

async def import_products():
    """Import products into database"""
    print("Starting product import...")
    
    # Load frontend products
    frontend_products = load_frontend_products()
    if not frontend_products:
        print("No products to import")
        return
    
    # Configure database
    settings = get_settings()
    configure_engine(settings)
    await init_db()
    
    # Import products
    imported_count = 0
    skipped_count = 0
    
    async for session in get_session():
        from sqlalchemy import select
        
        for i, frontend_product in enumerate(frontend_products, 1):
            try:
                # Check if product already exists
                existing_result = await session.execute(
                    select(Product).where(Product.slug == frontend_product.get('_id', ''))
                )
                existing = existing_result.scalar_one_or_none()
                
                if existing:
                    print(f"Skipping product {i}: {frontend_product.get('name')} (already exists)")
                    skipped_count += 1
                    continue
                
                # Convert and create product
                db_product_data = convert_frontend_to_db(frontend_product)
                product = Product(**db_product_data)
                
                session.add(product)
                await session.flush()
                
                print(f"Imported product {i}: {frontend_product.get('name')} ({frontend_product.get('category')})")
                imported_count += 1
                
            except Exception as e:
                print(f"Error importing product {frontend_product.get('name')}: {e}")
                continue
        
        await session.commit()
        break
    
    print(f"\nImport complete!")
    print(f"Successfully imported: {imported_count} products")
    print(f"Skipped (already exists): {skipped_count} products")
    print(f"Total processed: {imported_count + skipped_count} products")

if __name__ == "__main__":
    asyncio.run(import_products())
