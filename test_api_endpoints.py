#!/usr/bin/env python3
import requests
import json

# Test various endpoints to see what's working on production
base_url = "https://tamilnaduproducts.com"

endpoints = [
    "/api/products",
    "/api/payments/config", 
    "/create-order",
    "/verify-payment"
]

print("Testing production endpoints:")

for endpoint in endpoints:
    try:
        if endpoint == "/create-order" or endpoint == "/verify-payment":
            # POST endpoints
            payload = {"test": "data"}
            response = requests.post(f"{base_url}{endpoint}", json=payload, timeout=5)
        else:
            # GET endpoints
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
        
        print(f"{endpoint}: {response.status_code}")
        if response.status_code == 200:
            print(f"  Success: {len(response.text)} chars")
        else:
            print(f"  Error: {response.text[:100]}")
    except Exception as e:
        print(f"{endpoint}: Error - {e}")
    
    print()
