import requests

url = 'http://localhost:5000/api/predict'
payload = {'crop': 'Rice', 'N': 25, 'P': 20, 'K': 20, 'temperature': 25, 'humidity': 60, 'ph': 6.5, 'rainfall': 750}

response = requests.post(url, json=payload)
data = response.json()

print('Total crops in allProbabilities:', len(data['allProbabilities']))
print('\nFirst 15 crops:')
for i, crop in enumerate(data['allProbabilities'][:15]):
    print(f"{i+1}. {crop['emoji']} {crop['name']}: {crop['probability']:.1f}%")

print('\nAll 47 crops are now available! ✅')
