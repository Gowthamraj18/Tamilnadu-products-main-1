#!/usr/bin/env python3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if Razorpay keys are loaded
razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")

print("Environment Variables Check:")
print(f"RAZORPAY_KEY_ID: {razorpay_key_id}")
print(f"RAZORPAY_KEY_SECRET: {'SET' if razorpay_key_secret else 'NOT SET'}")

# Try to import and use the config
try:
    from app.config import get_settings
    settings = get_settings()
    print("\nSettings from app.config:")
    print(f"razorpay_key_id: {settings.get('razorpay_key_id')}")
    print(f"razorpay_key_secret: {'SET' if settings.get('razorpay_key_secret') else 'NOT SET'}")
except Exception as e:
    print(f"Error importing config: {e}")
