#!/usr/bin/env python3
import requests
import json

# Test the verify-payment endpoint directly
url = "http://localhost:8000/verify-payment"

# Test payload (with dummy data for testing)
payload = {
    "orderId": "test_order_123",
    "razorpay_payment_id": "pay_test_payment_id",
    "razorpay_order_id": "order_test_order_id",
    "razorpay_signature": "test_signature"
}

print("Testing /verify-payment endpoint:")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccess! Payment verified")
    else:
        print(f"\nExpected error: {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("Connection error - is the backend running?")
except Exception as e:
    print(f"Error: {e}")
