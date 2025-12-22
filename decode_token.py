import base64
import json
from datetime import datetime

token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0LmNhbmRpZGF0ZUBqb2J2ZXJzZS5jb20iLCJpYXQiOjE3NjYzMjgwMjIsImV4cCI6MTc2NjQxNDQyMn0.BJkaDoWq2evdXSJLWwomVBIzSIdJKe8kjjjOjwla7M4"

# Split token
parts = token.split('.')
payload = parts[1]

# Add padding if needed
padding = len(payload) % 4
if padding:
    payload += '=' * (4 - padding)

# Decode
decoded = base64.b64decode(payload)
payload_json = json.loads(decoded)

print("Token Payload:", json.dumps(payload_json, indent=2))

# Check expiration
exp_timestamp = payload_json['exp']
iat_timestamp = payload_json['iat']

exp_date = datetime.fromtimestamp(exp_timestamp)
iat_date = datetime.fromtimestamp(iat_timestamp)
now = datetime.now()

print(f"\nIssued at: {iat_date}")
print(f"Expires at: {exp_date}")
print(f"Current time: {now}")
print(f"Is expired: {now > exp_date}")
print(f"Time remaining: {exp_date - now}")
