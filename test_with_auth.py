#!/usr/bin/env python3
import requests
import json

# Test the create-order endpoint with authentication (like frontend)
url = "http://localhost:8000/create-order"

# Test payload matching frontend format
payload = {
    "amount": 51900,  # Already in paise from frontend
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

# Test with authentication header (like frontend)
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer invalid_token'  # This might cause the 500 error
}

print("Testing /create-order endpoint with authentication:")
print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, headers=headers)
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

# Also test without authentication
print("\n" + "="*50)
print("Testing without authentication:")

try:
    response = requests.post(url, json=payload)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccess! Order ID: {data.get('data', {}).get('id')}")
    else:
        print(f"\nError: {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}")
