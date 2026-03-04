#!/usr/bin/env python3
"""Direct test of the mock_predict and advisory functions."""

from app import mock_predict
from gemini_service import generate_crop_advisory

# Test input
input_data = {
    "crop": "Rice",
    "nitrogen": 25,
    "phosphorus": 20,
    "potassium": 20,
    "temperature": 25,
    "humidity": 60,
    "ph": 6.5,
    "rainfall": 750
}

try:
    print("Testing mock_predict...")
    prediction = mock_predict(input_data)
    print(f"✓ Prediction: {prediction}")
    
    print("\nTesting generate_crop_advisory...")
    advisory = generate_crop_advisory(prediction["crop"], input_data)
    print(f"✓ Advisory keys: {list(advisory.keys())}")
    print(f"✓ Advisory (truncated): {str(advisory)[:200]}")
    
    print("\n✓ ALL TESTS PASSED")
except Exception as e:
    print(f"✗ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
