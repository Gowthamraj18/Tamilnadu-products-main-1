#!/usr/bin/env python3
import requests
import json

# Test the create-order endpoint directly
url = "http://localhost:8000/create-order"

# Test payload
payload = {
    "orderId": "test_order_123",
    "amount": 51900,  # 519 rupees in paise (499 + 20)
    "items": [
        {
            "product_id": 1,
            "price": 499.00,
            "quantity": 1
        }
    ],
    "subtotal": 499.00,
    "shipping": 20.00,
    "handling": 0.00
}

print("Testing /create-order endpoint:")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccess! Order ID: {data.get('data', {}).get('id')}")
    else:
        print(f"\nError: {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("Connection error - is the backend running?")
except Exception as e:
    print(f"Error: {e}")
