import sys
import os
os.chdir('C:\\Users\\dasar\\Downloads\\farm-futura-ai-main\\farm-futura-ai-main\\backend')
sys.path.insert(0, '.')

# Import fresh 
if 'app' in sys.modules:
    del sys.modules['app']
    
import app

# Check if preference is in the code
import inspect
source = inspect.getsource(app.mock_predict)
if 'PREFERRED_CROPS' in source:
    print("✅ PREFERRED_CROPS found in code")
    print("\nCode snippet:")
    for line in source.split('\n')[5:12]:
        print(line)
else:
    print("❌ PREFERRED_CROPS NOT found in code")

# Test direct
input_data = {'crop': 'Rice', 'N': 25, 'P': 20, 'K': 20, 'temperature': 25, 'humidity': 60, 'ph': 6.5, 'rainfall': 750}
result = app.mock_predict(input_data)

print("\n\nTop 15 Crops from Direct Test:")
print("=" * 55)
for i, crop in enumerate(result['allProbabilities'][:15]):
    is_preferred = crop['name'] in ['Rice', 'Wheat', 'Bajra', 'Maize', 'Chilli', 'Cotton']
    marker = '✅ PREFERRED' if is_preferred else ''
    print(f"{i+1:2}. {crop['emoji']} {crop['name']:<15} {crop['probability']:>7.2f}% {marker}")
