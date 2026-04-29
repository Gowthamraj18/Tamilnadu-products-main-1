#!/usr/bin/env python3
import requests
import json

# Test the create-order endpoint exactly like the frontend does
url = "http://localhost:8000/create-order"

# Simulate exact frontend request format
token = "test_token"  # This would be the actual user token
authPart = {"Authorization": f"Bearer {token}"} if token else {}

# Calculate pricing like frontend does
subtotal = 499.0
shipping = 20.0
handling = 0.0
total = subtotal + shipping + handling

# Prepare cart items exactly like frontend
items = [
    {
        "product_id": 1,
        "name": "THE ADDAMS FAMILY",
        "price": 499.0,
        "quantity": 1,
        "size": "",
        "color": ""
    }
]

# Exact frontend payload
payload = { 
    "amount": int(total * 100),  # Frontend converts to paise
    "orderId": "test_order_123",
    "items": items,
    "subtotal": subtotal,
    "shipping": shipping,
    "handling": handling
}

headers = {
    'Content-Type': 'application/json',
    **authPart,
}

print("Testing exact frontend request format:")
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

# Also test with potential problematic data
print("\n" + "="*50)
print("Testing with potentially problematic data:")

# Test with string product_id (common frontend issue)
items_with_string_id = [
    {
        "product_id": "1",  # String instead of number
        "name": "THE ADDAMS FAMILY",
        "price": 499.0,
        "quantity": 1,
        "size": "",
        "color": ""
    }
]

payload_string_id = { 
    "amount": int(total * 100),
    "orderId": "test_order_123",
    "items": items_with_string_id,
    "subtotal": subtotal,
    "shipping": shipping,
    "handling": handling
}

try:
    response = requests.post(url, json=payload_string_id, headers=headers)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")
