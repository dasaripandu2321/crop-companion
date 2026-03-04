import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()
KEY = os.getenv('GEMINI_API_KEY')

models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp'
]

versions = ['v1', 'v1beta']

for m in models:
    for v in versions:
        url = f'https://generativelanguage.googleapis.com/{v}/models/{m}:generateContent?key={KEY}'
        try:
            resp = requests.post(
                url, 
                json={'contents': [{'parts': [{'text': 'hi'}]}]},
                timeout=10
            )
            print(f"{v} {m}: {resp.status_code}")
            if resp.status_code != 200 and resp.status_code != 429:
                print(f"  Error: {resp.text[:200]}")
        except Exception as e:
            print(f"{v} {m}: Error {e}")

# quick local sanity check (requires backend server running)
try:
    sample = {
        "N": 80,
        "P": 48,
        "K": 40,
        "temperature": 24,
        "humidity": 82,
        "ph": 6.5,
        "rainfall": 230,
    }
    resp = requests.post("http://localhost:5000/api/predict", json=sample, timeout=10)
    print("local predict", resp.status_code, resp.json())
except Exception as e:
    print("local predict error", e)

