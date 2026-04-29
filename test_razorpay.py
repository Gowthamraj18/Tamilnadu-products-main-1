#!/usr/bin/env python3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test Razorpay client creation
try:
    from razorpay import Client as RazorpayClient
    
    razor_key_id = os.getenv("RAZORPAY_KEY_ID")
    razor_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    
    print("Testing Razorpay Client Creation:")
    print(f"Key ID: {razor_key_id}")
    print(f"Key Secret: {'SET' if razor_key_secret else 'NOT SET'}")
    
    if razor_key_id and razor_key_secret:
        rzp = RazorpayClient(auth=(razor_key_id, razor_key_secret))
        print("Razorpay client created successfully!")
        
        # Test creating a small order
        try:
            order_data = {
                "amount": 100,  # 1 rupee in paise
                "currency": "INR",
                "receipt": "test_receipt_123",
                "notes": {"test": "order"}
            }
            order = rzp.order.create(order_data)
            print(f"Test order created: {order}")
        except Exception as e:
            print(f"Error creating test order: {e}")
    else:
        print("Missing Razorpay keys!")
        
except ImportError as e:
    print(f"Error importing razorpay: {e}")
except Exception as e:
    print(f"Error: {e}")
