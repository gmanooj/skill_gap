import urllib.request
import json

base = 'http://127.0.0.1:8000/api'
endpoints = [
    '/auth/dashboard/stats',
    '/auth/student/profile',
    '/auth/jobs',
    '/auth/analysis',
    '/auth/recommendations',
    '/auth/admin/students',
    '/auth/admin/candidate-screening'
]

print("--- Testing API Endpoints ---")
for ep in endpoints:
    url = base + ep
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            body = json.loads(response.read().decode('utf-8'))
            print(f"{ep:35} -> Status: {status}, Success: {body.get('success')}")
    except Exception as e:
        print(f"{ep:35} -> ERROR: {e}")
