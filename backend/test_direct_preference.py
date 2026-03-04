import sys
sys.path.insert(0, 'C:\\Users\\dasar\\Downloads\\farm-futura-ai-main\\farm-futura-ai-main\\backend')

# Force reload
import importlib
import app
importlib.reload(app)

# Test directly
input_data = {'crop': 'Rice', 'N': 25, 'P': 20, 'K': 20, 'temperature': 25, 'humidity': 60, 'ph': 6.5, 'rainfall': 750}
result = app.mock_predict(input_data)

print("Top 10 Crops from Direct Test:")
print("=" * 55)
for i, crop in enumerate(result['allProbabilities'][:10]):
    is_preferred = crop['name'] in ['Rice', 'Wheat', 'Bajra', 'Maize', 'Chilli', 'Cotton']
    marker = '✨ PREFERRED' if is_preferred else ''
    print(f"{i+1}. {crop['emoji']} {crop['name']:<15} {crop['probability']:>7.2f}%   {marker}")
