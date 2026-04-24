#!/usr/bin/env python3
import sqlite3
import bcrypt

def fix_password_hash():
    # Generate proper bcrypt hash
    password = 'Test@123'
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    # Update database
    conn = sqlite3.connect('tamilnadu_products.db')
    cursor = conn.cursor()
    
    # Update user password
    cursor.execute('UPDATE users SET password_hash = ? WHERE email = ?', 
                   (password_hash.decode('utf-8'), 'sjayashree2020@gmail.com'))
    
    conn.commit()
    conn.close()
    
    print(f"Password hash updated successfully!")
    print(f"New hash: {password_hash.decode('utf-8')}")

if __name__ == "__main__":
    fix_password_hash()
