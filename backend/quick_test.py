import requests

print('hitting local predict endpoint')
sample = {"N":80,"P":48,"K":40,"temperature":24,"humidity":82,"ph":6.5,"rainfall":230}
resp = requests.post('http://localhost:5000/api/predict', json=sample, timeout=10)
print('status', resp.status_code)
print('text:', resp.text)
