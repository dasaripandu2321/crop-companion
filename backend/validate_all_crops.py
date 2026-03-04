#!/usr/bin/env python3
"""
Comprehensive validation test for all crops in the mock advisory system.
Tests each crop via /api/predict and validates response structure.
"""

import requests
import json
from typing import Dict, List

# Complete crop list from user request
ALL_CROPS = [
    "Rice", "Wheat", "Maize", "Barley", "Ragi", "Bajra", "Jowar",
    "Red Gram (Tur)", "Green Gram (Moong)", "Black Gram (Urad)",
    "Chickpea (Chana)", "Lentil (Masoor)", "Pea", "Groundnut",
    "Mustard", "Sunflower", "Soybean", "Sesame (Til)", "Castor",
    "Coconut", "Cotton", "Sugarcane", "Jute", "Tea", "Coffee",
    "Rubber", "Tobacco", "Mango", "Banana", "Apple", "Orange",
    "Grapes", "Papaya", "Guava", "Tomato", "Potato", "Onion",
    "Brinjal", "Cabbage", "Cauliflower", "Carrot", "Radish",
    "Spinach", "Coriander", "Chilli", "Turmeric", "Ginger"
]

REQUIRED_ADVISORY_FIELDS = [
    "technical_explanation",
    "fertilizer_plan",
    "irrigation_strategy",
    "pest_prevention",
    "yield_optimization",
    "seasonal_advice",
    "market_insight",
    "government_schemes",
    "summaries"
]

def test_crop(crop_name: str, api_url: str = "http://localhost:5000") -> Dict:
    """Test a single crop and validate response structure."""
    try:
        # POST data to /api/predictmn
        payload = {
            "crop": crop_name,
            "N": 25,
            "P": 20,
            "K": 20,
            "temperature": 25,
            "humidity": 60,
            "ph": 6.5,
            "rainfall": 750
        }
        
        response = requests.post(f"{api_url}/api/predict", json=payload, timeout=10)
        
        if response.status_code != 200:
            return {
                "crop": crop_name,
                "status": "FAIL",
                "reason": f"HTTP {response.status_code}",
                "details": response.text[:200]
            }
        
        data = response.json()
        
        # Check if ai_advisory exists
        if "ai_advisory" not in data:
            return {
                "crop": crop_name,
                "status": "FAIL",
                "reason": "Missing 'ai_advisory' field"
            }
        
        advisory = data["ai_advisory"]
        
        # Check for error field (mock fallback shouldn't have errors)
        if isinstance(advisory, dict) and "error" in advisory:
            return {
                "crop": crop_name,
                "status": "FAIL",
                "reason": f"Advisory returned error: {advisory['error'][:100]}"
            }
        
        # Validate advisory structure
        if not isinstance(advisory, dict):
            return {
                "crop": crop_name,
                "status": "FAIL",
                "reason": f"ai_advisory is not a dict, got {type(advisory)}"
            }
        
        missing_fields = [f for f in REQUIRED_ADVISORY_FIELDS if f not in advisory]
        
        if missing_fields:
            return {
                "crop": crop_name,
                "status": "FAIL",
                "reason": f"Missing fields: {', '.join(missing_fields)}"
            }
        
        # Check that summaries has multiple languages
        summaries = advisory.get("summaries", {})
        if not isinstance(summaries, dict) or len(summaries) == 0:
            return {
                "crop": crop_name,
                "status": "FAIL",
                "reason": "Summaries field missing or empty"
            }
        
        return {
            "crop": crop_name,
            "status": "PASS",
            "languages": list(summaries.keys()),
            "fields_count": len(advisory)
        }
        
    except requests.exceptions.ConnectionError:
        return {
            "crop": crop_name,
            "status": "ERROR",
            "reason": "Cannot connect to API (ensure backend is running on :5000)"
        }
    except Exception as e:
        return {
            "crop": crop_name,
            "status": "ERROR",
            "reason": str(e)[:100]
        }

def run_validation():
    """Run validation for all crops and print results."""
    print("=" * 80)
    print("FARM FUTURA AI - CROP ADVISORY VALIDATION TEST")
    print("=" * 80)
    print(f"Testing {len(ALL_CROPS)} crops...\n")
    
    results = []
    for crop in ALL_CROPS:
        result = test_crop(crop)
        results.append(result)
        
        # Print live feedback
        status_symbol = "✓" if result["status"] == "PASS" else "✗"
        print(f"{status_symbol} {crop:30} | {result['status']}")
    
    # Summary
    print("\n" + "=" * 80)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    errors = sum(1 for r in results if r["status"] == "ERROR")
    
    print(f"SUMMARY: {passed} PASS | {failed} FAIL | {errors} ERROR (Total: {len(ALL_CROPS)})")
    print("=" * 80)
    
    # Show failures
    if failed > 0 or errors > 0:
        print("\nFAILURES & ERRORS:")
        for result in results:
            if result["status"] != "PASS":
                print(f"\n  {result['crop']}:")
                print(f"    Status: {result['status']}")
                print(f"    Reason: {result['reason']}")
                if "details" in result:
                    print(f"    Details: {result['details']}")
    
    return passed == len(ALL_CROPS)

if __name__ == "__main__":
    success = run_validation()
    exit(0 if success else 1)
