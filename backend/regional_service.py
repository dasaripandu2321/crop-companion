"""
Regional Advisory Service
Provides region-specific crop recommendations and insights using AI
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
target_model = "gemini-2.0-flash"

# Indian agricultural regions with characteristics
INDIAN_REGIONS = {
    "Punjab": {
        "climate": "Semi-arid to sub-humid",
        "soil": "Alluvial",
        "major_crops": ["Wheat", "Rice", "Cotton", "Sugarcane"],
        "rainfall": "500-900mm",
        "challenges": ["Water scarcity", "Soil degradation"]
    },
    "Haryana": {
        "climate": "Semi-arid",
        "soil": "Alluvial",
        "major_crops": ["Wheat", "Rice", "Bajra", "Mustard"],
        "rainfall": "400-700mm",
        "challenges": ["Groundwater depletion", "Heat stress"]
    },
    "Uttar Pradesh": {
        "climate": "Tropical to sub-tropical",
        "soil": "Alluvial",
        "major_crops": ["Wheat", "Rice", "Sugarcane", "Potato"],
        "rainfall": "600-1200mm",
        "challenges": ["Fragmented holdings", "Pest pressure"]
    },
    "Maharashtra": {
        "climate": "Tropical to semi-arid",
        "soil": "Black cotton soil (Regur)",
        "major_crops": ["Cotton", "Sugarcane", "Soybean", "Jowar"],
        "rainfall": "400-3000mm (varies)",
        "challenges": ["Drought", "Erratic rainfall"]
    },
    "Karnataka": {
        "climate": "Tropical to semi-arid",
        "soil": "Red laterite, black",
        "major_crops": ["Rice", "Ragi", "Jowar", "Coffee"],
        "rainfall": "500-3000mm",
        "challenges": ["Water management", "Soil erosion"]
    },
    "Tamil Nadu": {
        "climate": "Tropical",
        "soil": "Red loamy, black, alluvial",
        "major_crops": ["Rice", "Sugarcane", "Cotton", "Groundnut"],
        "rainfall": "800-1400mm",
        "challenges": ["Water scarcity", "Cyclones"]
    },
    "Andhra Pradesh": {
        "climate": "Tropical",
        "soil": "Red sandy, black, alluvial",
        "major_crops": ["Rice", "Cotton", "Chilli", "Turmeric"],
        "rainfall": "900-1200mm",
        "challenges": ["Cyclones", "Pest management"]
    },
    "Telangana": {
        "climate": "Semi-arid to tropical",
        "soil": "Red sandy, black",
        "major_crops": ["Rice", "Cotton", "Maize", "Turmeric"],
        "rainfall": "900-1100mm",
        "challenges": ["Water stress", "Soil fertility"]
    },
    "West Bengal": {
        "climate": "Tropical to sub-tropical",
        "soil": "Alluvial, laterite",
        "major_crops": ["Rice", "Jute", "Potato", "Tea"],
        "rainfall": "1500-2500mm",
        "challenges": ["Flooding", "Pest diseases"]
    },
    "Kerala": {
        "climate": "Tropical humid",
        "soil": "Laterite, alluvial",
        "major_crops": ["Coconut", "Rubber", "Tea", "Coffee"],
        "rainfall": "2000-3500mm",
        "challenges": ["Heavy rainfall", "Landslides"]
    },
    "Gujarat": {
        "climate": "Semi-arid to arid",
        "soil": "Alluvial, black",
        "major_crops": ["Cotton", "Groundnut", "Bajra", "Wheat"],
        "rainfall": "400-1000mm",
        "challenges": ["Drought", "Salinity"]
    },
    "Rajasthan": {
        "climate": "Arid to semi-arid",
        "soil": "Sandy, alluvial",
        "major_crops": ["Bajra", "Wheat", "Mustard", "Barley"],
        "rainfall": "100-600mm",
        "challenges": ["Water scarcity", "Desert conditions"]
    },
    "Madhya Pradesh": {
        "climate": "Tropical to sub-tropical",
        "soil": "Black, red, alluvial",
        "major_crops": ["Wheat", "Soybean", "Chickpea", "Rice"],
        "rainfall": "800-1600mm",
        "challenges": ["Erratic rainfall", "Soil erosion"]
    },
    "Bihar": {
        "climate": "Sub-tropical",
        "soil": "Alluvial",
        "major_crops": ["Rice", "Wheat", "Maize", "Sugarcane"],
        "rainfall": "1000-1400mm",
        "challenges": ["Flooding", "Fragmented holdings"]
    },
    "Odisha": {
        "climate": "Tropical",
        "soil": "Red laterite, alluvial",
        "major_crops": ["Rice", "Pulses", "Oilseeds", "Jute"],
        "rainfall": "1200-1600mm",
        "challenges": ["Cyclones", "Flooding"]
    }
}

REGIONAL_SUMMARY_PROMPT = """You are an expert agricultural advisor specializing in Indian regional farming.

Region: {{region}}
Regional Characteristics:
- Climate: {{climate}}
- Soil Type: {{soil}}
- Major Crops: {{major_crops}}
- Average Rainfall: {{rainfall}}
- Key Challenges: {{challenges}}

Predicted Crop: {{crop}}
Farmer's Soil & Environment Data:
- Nitrogen: {{N}} kg/ha
- Phosphorus: {{P}} kg/ha
- Potassium: {{K}} kg/ha
- Temperature: {{temperature}} °C
- Humidity: {{humidity}} %
- pH: {{ph}}
- Rainfall: {{rainfall_input}} mm

Provide a comprehensive regional analysis in JSON format:

{
  "regional_suitability": {
    "score": 0-100,
    "explanation": "Why this crop suits/doesn't suit this region"
  },
  "climate_match": {
    "temperature_fit": "excellent/good/moderate/poor",
    "rainfall_fit": "excellent/good/moderate/poor",
    "seasonal_timing": "Best planting and harvesting months for this region"
  },
  "soil_compatibility": {
    "soil_match": "excellent/good/moderate/poor",
    "amendments_needed": "Specific soil improvements for this region"
  },
  "regional_best_practices": {
    "varieties": "Recommended varieties for this region",
    "irrigation": "Region-specific irrigation strategies",
    "pest_management": "Common regional pests and solutions"
  },
  "market_insights": {
    "local_demand": "Market demand in this region",
    "nearby_mandis": "Major agricultural markets nearby",
    "price_trends": "Typical price patterns"
  },
  "success_stories": "Brief examples of successful farmers in this region with this crop",
  "regional_schemes": "State-specific agricultural schemes and subsidies",
  "weather_advisory": "Seasonal weather patterns and precautions for this region",
  "alternative_crops": ["List 3 alternative crops well-suited to this region with current conditions"]
}

Return ONLY valid JSON. No extra text.
"""


def get_mock_regional_summary(region: str, crop: str) -> dict:
    """Mock regional summary for testing"""
    region_data = INDIAN_REGIONS.get(region, INDIAN_REGIONS["Punjab"])
    
    return {
        "regional_suitability": {
            "score": 85,
            "explanation": f"{crop} is well-suited to {region}'s {region_data['climate']} climate and {region_data['soil']} soil conditions."
        },
        "climate_match": {
            "temperature_fit": "good",
            "rainfall_fit": "good",
            "seasonal_timing": "Plant in June-July, harvest in October-November"
        },
        "soil_compatibility": {
            "soil_match": "excellent",
            "amendments_needed": "Add organic compost and maintain pH 6.0-7.0"
        },
        "regional_best_practices": {
            "varieties": f"Use locally adapted varieties popular in {region}",
            "irrigation": "Drip irrigation recommended to conserve water",
            "pest_management": "Monitor for regional pests, use IPM strategies"
        },
        "market_insights": {
            "local_demand": "High demand in local markets",
            "nearby_mandis": f"Major mandis in {region} region",
            "price_trends": "Stable prices with seasonal variations"
        },
        "success_stories": f"Many farmers in {region} have successfully grown {crop} with proper management",
        "regional_schemes": f"Check with {region} agriculture department for state schemes",
        "weather_advisory": f"Monitor {region} weather patterns, prepare for {', '.join(region_data['challenges'])}",
        "alternative_crops": region_data["major_crops"][:3]
    }


def generate_regional_summary(region: str, crop: str, input_data: dict, timeout_sec: float = 15.0) -> dict:
    """Generate AI-powered regional summary"""
    
    if region not in INDIAN_REGIONS:
        return {"error": f"Region '{region}' not supported. Available regions: {', '.join(INDIAN_REGIONS.keys())}"}
    
    if not API_KEY:
        print(f"[FALLBACK] No API key. Returning mock regional summary for {region} - {crop}")
        return get_mock_regional_summary(region, crop)
    
    try:
        region_data = INDIAN_REGIONS[region]
        
        prompt = REGIONAL_SUMMARY_PROMPT.replace("{{region}}", region)
        prompt = prompt.replace("{{climate}}", region_data["climate"])
        prompt = prompt.replace("{{soil}}", region_data["soil"])
        prompt = prompt.replace("{{major_crops}}", ", ".join(region_data["major_crops"]))
        prompt = prompt.replace("{{rainfall}}", region_data["rainfall"])
        prompt = prompt.replace("{{challenges}}", ", ".join(region_data["challenges"]))
        prompt = prompt.replace("{{crop}}", crop)
        prompt = prompt.replace("{{N}}", str(input_data.get("N", 25)))
        prompt = prompt.replace("{{P}}", str(input_data.get("P", 20)))
        prompt = prompt.replace("{{K}}", str(input_data.get("K", 20)))
        prompt = prompt.replace("{{temperature}}", str(input_data.get("temperature", 25)))
        prompt = prompt.replace("{{humidity}}", str(input_data.get("humidity", 60)))
        prompt = prompt.replace("{{ph}}", str(input_data.get("ph", 6.5)))
        prompt = prompt.replace("{{rainfall_input}}", str(input_data.get("rainfall", 750)))
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.95,
                "maxOutputTokens": 2048
            }
        }
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={API_KEY}"
        r = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=timeout_sec)
        r.raise_for_status()
        
        response_text = r.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        
        if not response_text:
            print(f"[FALLBACK] Empty response. Returning mock.")
            return get_mock_regional_summary(region, crop)
        
        # Clean JSON
        text = response_text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join([l for l in lines if not l.startswith("```")])
        
        summary = json.loads(text)
        print(f"[SUCCESS] Regional summary for {region} - {crop}")
        return summary
        
    except Exception as exc:
        print(f"[FALLBACK] Error: {exc}. Returning mock.")
        return get_mock_regional_summary(region, crop)


def get_available_regions() -> list:
    """Return list of supported regions"""
    return list(INDIAN_REGIONS.keys())
