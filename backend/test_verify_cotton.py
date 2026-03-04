import requests

url = 'http://localhost:5000/api/predict'
payload = {'crop': 'Rice', 'N': 25, 'P': 20, 'K': 20, 'temperature': 25, 'humidity': 60, 'ph': 6.5, 'rainfall': 750}

response = requests.post(url, json=payload)
data = response.json()

preferred = ['Rice', 'Wheat', 'Bajra', 'Maize', 'Chilli', 'Cotton']

print("Checking all 46 crops for preferred items:")
print("-" * 50)

for crop_name in preferred:
    found = False
    for crop in data['allProbabilities']:
        if crop['name'] == crop_name:
            found = True
            print(f"FOUND: {crop['emoji']} {crop_name}: {crop['probability']:.2f}%")
            break
    if not found:
        print(f"MISSING: {crop_name} (not in results)")

print(f"\nTotal crops in response: {len(data['allProbabilities'])}")

# Check if Cotton appears later in the list
print("\nSearching for Cotton in full list...")
for i, crop in enumerate(data['allProbabilities']):
    if 'Cotton' in crop['name'] or crop['emoji'] == '☁️':
        print(f"Position {i+1}: {crop['emoji']} {crop['name']}")
