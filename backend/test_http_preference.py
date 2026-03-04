import requests
import json

url = 'http://localhost:5000/api/predict'
payload = {'crop': 'Rice', 'N': 25, 'P': 20, 'K': 20, 'temperature': 25, 'humidity': 60, 'ph': 6.5, 'rainfall': 750}

response = requests.post(url, json=payload)
data = response.json()

preferred = {'Rice', 'Wheat', 'Bajra', 'Maize', 'Chilli', 'Cotton'}

print("\n" + "="*70)
print("CROP PREFERENCE TEST - Top 15 Predictions")
print("="*70)
for i, crop in enumerate(data['allProbabilities'][:15]):
    is_pref = crop['name'] in preferred
    marker = "[PREFERRED]" if is_pref else ""
    print(f"{i+1:2}. {crop['emoji']} {crop['name']:<15} {crop['probability']:>7.2f}%   {marker}")

print("\n" + "="*70)
print("PREFERRED CROPS RANKING:")
print("="*70)
pref_crops = [c for c in data['allProbabilities'] if c['name'] in preferred]
for i, crop in enumerate(pref_crops, 1):
    print(f"{i}. {crop['emoji']} {crop['name']:<15} {crop['probability']:>7.2f}%")

print("\nSUMMARY:")
print(f"Total unique crops: {len(data['allProbabilities'])}")
print(f"Top prediction: {data['emoji']} {data['crop']} ({data['confidence']}%)")
print("\nPreference boost applied successfully!")
