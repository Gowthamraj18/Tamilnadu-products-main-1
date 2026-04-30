#!/usr/bin/env python3
import requests
import json

# Test the correct production endpoint that frontend calls
url = "https://tamilnaduproducts.com/api/orders/create-order"

payload = {
    "customerEmail": "test@example.com",
    "customerName": "Test User",
    "customerPhone": "1234567890",
    "totalAmount": 519.0,
    "products": [
        {
            "product_id": 1,
            "name": "THE ADDAMS FAMILY",
            "price": 499.0,
            "quantity": 1
        }
    ],
    "shippingAddress": {
        "address": "123 Test Street",
        "city": "Test City",
        "state": "Test State",
        "pincode": "123456"
    }
}

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test_token'
}

print("Testing production endpoint with correct path:")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccess! Order ID: {data.get('data', {}).get('id')}")
    else:
        print(f"\nError: {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}")
