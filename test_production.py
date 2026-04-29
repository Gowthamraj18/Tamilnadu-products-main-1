#!/usr/bin/env python3
import requests
import json

# Test the production deployment
url = "https://tamilnaduproducts.com/create-order"

payload = {
    "amount": 51900,
    "orderId": "test_order_123",
    "items": [
        {
            "product_id": 1,
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

headers = {
    'Content-Type': 'application/json'
}

print("Testing production deployment:")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccess! Order ID: {data.get('data', {}).get('id')}")
    else:
        print(f"\nError: {response.status_code}")
        
except requests.exceptions.Timeout:
    print("Request timed out")
except requests.exceptions.ConnectionError:
    print("Connection error - production site may be down")
except Exception as e:
    print(f"Error: {e}")
