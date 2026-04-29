#!/usr/bin/env python3
import sqlite3
import json

def check_json_fields():
    conn = sqlite3.connect('tamilnadu_products.db')
    cursor = conn.cursor()

    # Check JSON fields in products
    cursor.execute('SELECT id, name, images_json, sizes_json, colors_json, tags_json, size_stock_json, seo_json, specifications_json FROM products LIMIT 3')
    products = cursor.fetchall()
    
    print('Checking JSON fields in products:')
    for product in products:
        print(f'\nProduct ID: {product[0]}, Name: {product[1]}')
        
        json_fields = [
            ('images_json', product[2]),
            ('sizes_json', product[3]),
            ('colors_json', product[4]),
            ('tags_json', product[5]),
            ('size_stock_json', product[6]),
            ('seo_json', product[7]),
            ('specifications_json', product[8])
        ]
        
        for field_name, field_value in json_fields:
            try:
                if field_value:
                    json.loads(field_value)
                    print(f'  {field_name}: OK')
                else:
                    print(f'  {field_name}: NULL/Empty')
            except json.JSONDecodeError as e:
                print(f'  {field_name}: ERROR - {e}')
                print(f'    Value: {field_value}')

    conn.close()

if __name__ == "__main__":
    check_json_fields()
