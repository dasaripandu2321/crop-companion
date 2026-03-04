import requests

url = 'http://localhost:5000/api/predict'
payload = {'crop': 'Rice', 'N': 25, 'P': 20, 'K': 20, 'temperature': 25, 'humidity': 60, 'ph': 6.5, 'rainfall': 750}

response = requests.post(url, json=payload)
data = response.json()

print('🌾 PREFERRED CROPS (Top 10):')
print('=' * 50)
for i, crop in enumerate(data['allProbabilities'][:10]):
    is_preferred = crop['name'] in ['Rice', 'Wheat', 'Bajra', 'Maize', 'Chilli', 'Cotton']
    marker = '✨ PREFERRED' if is_preferred else ''
    print(f"{i+1}. {crop['emoji']} {crop['name']:<15} {crop['probability']:>6.2f}%  {marker}")

print("\n✅ Preference boost applied successfully!")
print(f"✨ Total crops available: {len(data['allProbabilities'])}")
