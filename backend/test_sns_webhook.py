import json
import urllib.request
import urllib.error

payload = {
    "message": "Book me with Dr. Mehta tomorrow at 10 AM.",
    "patient_id": "PAT-1025",
    "user_role": "patient"
}

url = "https://api.agents.snsihub.ai/webhook/237b73c3-d493-48dd-9af6-2723087599ab"
req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(f"Status: {resp.status}")
        print(f"Body: {resp.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(f"Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
