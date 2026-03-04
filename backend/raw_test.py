import requests
import json
sample={"N":80,"P":48,"K":40,"temperature":24,"humidity":82,"ph":6.5,"rainfall":230}
resp=requests.post('http://localhost:5000/api/predict', json=sample, timeout=10)
print("HTTP Status:", resp.status_code)
data = resp.json()
print("Response JSON:")
print(json.dumps(data, indent=2))
