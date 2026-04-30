#!/usr/bin/env python3
import requests
import json

# Test the diagnostic endpoint to check Razorpay configuration
url = "https://tamilnaduproducts.com/api/payments/diagnostic"

print("Testing Razorpay configuration in production:")
print(f"URL: {url}")

try:
    response = requests.get(url, timeout=10)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nDiagnostic Results:")
        print(json.dumps(data, indent=2))
        
        if data.get("success"):
            diagnostic = data.get("diagnostic", {})
            print(f"\nRazorpay Key ID: {diagnostic.get('razorpay_key_id', 'Not Set')}")
            print(f"Razorpay Secret Set: {diagnostic.get('razorpay_key_secret_set', False)}")
            print(f"Razorpay Client Status: {diagnostic.get('razorpay_client_status', 'Unknown')}")
            print(f"Environment: {diagnostic.get('environment', 'Unknown')}")
        else:
            print(f"Diagnostic failed: {data.get('error')}")
    else:
        print(f"Error: {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}")
