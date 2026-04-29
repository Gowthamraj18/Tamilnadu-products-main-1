#!/usr/bin/env python3
import sqlite3

def check_products():
    conn = sqlite3.connect('tamilnadu_products.db')
    cursor = conn.cursor()

    # Check if products table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='products'")
    table_exists = cursor.fetchone()
    print('Products table exists:', table_exists is not None)

    if table_exists:
        # Check total count
        cursor.execute('SELECT COUNT(*) FROM products')
        count = cursor.fetchone()[0]
        print(f'Total products in database: {count}')
        
        # Check active products
        cursor.execute('SELECT COUNT(*) FROM products WHERE active = 1')
        active_count = cursor.fetchone()[0]
        print(f'Active products: {active_count}')
        
        # Show sample products
        cursor.execute('SELECT id, name, category, active, price FROM products LIMIT 5')
        products = cursor.fetchall()
        print('Sample products:')
        for product in products:
            print(f'  ID: {product[0]}, Name: {product[1]}, Category: {product[2]}, Active: {product[3]}, Price: {product[4]}')
    else:
        print('Products table does not exist')
        
        # Check what tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print('Existing tables:', [table[0] for table in tables])

    conn.close()

if __name__ == "__main__":
    check_products()
