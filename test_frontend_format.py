#!/usr/bin/env python3
import requests
import json

# Test the create-order endpoint with frontend format
url = "http://localhost:8000/create-order"

# Test payload matching frontend format
payload = {
    "amount": 51900,  # Already in paise from frontend
    "orderId": "test_order_123",
    "items": [
        {
            "product_id": 1,  # Frontend sends as number
            "name": "THE ADDAMS FAMILY",
            "price": 499.0,
            "quantity": 1,
            "size": "",
            "color": ""
        }
    ],
    "subtotal": 499.0,
    "shipping": 20.0,
    "handling": 0.0
}

print("Testing /create-order endpoint with frontend format:")
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
