import urllib.request
import json
import urllib.error

base_url = 'https://fair-roses-arrive.loca.lt'

def test_endpoint(label, func):
    try:
        res = func()
        print(f"[PASS] {label}: {res}")
    except Exception as e:
        print(f"[FAIL] {label}: {e}")

# 1. Availability API
def test_1():
    url = f'{base_url}/api/v1/appointments/availability?doctor_id=DOC-101&date=2026-10-20'
    req = urllib.request.Request(url, headers={'bypass-tunnel-reminder': 'true'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        return f"{resp.status} - {data.get('summary')}"

# 2. Invalid Doctor Fallback
def test_2():
    url = f'{base_url}/api/v1/appointments/availability?doctor_id=DOC-999&date=2026-10-20'
    req = urllib.request.Request(url, headers={'bypass-tunnel-reminder': 'true'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return f"{resp.status}"

# 3. Missing Patient Context
def test_3():
    url = f'{base_url}/api/v1/appointments/book'
    try:
        req = urllib.request.Request(url,
            data=json.dumps({'doctor_id': 'DOC-101', 'appointment_date': '2026-10-20', 'time_slot': '09:00-09:30'}).encode(),
            headers={'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true'})
        urllib.request.urlopen(req, timeout=10)
        return "Unexpected 200"
    except urllib.error.HTTPError as e:
        return f"{e.code} (Correctly rejected for missing patient_id)"

# 4. RBAC Isolation
def test_4():
    url = f'{base_url}/api/v1/patients/PAT-1001/history'
    try:
        req = urllib.request.Request(url,
            headers={'X-User-Role': 'patient', 'X-Patient-Id': 'PAT-1025', 'bypass-tunnel-reminder': 'true'})
        urllib.request.urlopen(req, timeout=10)
        return "Unexpected 200"
    except urllib.error.HTTPError as e:
        return f"{e.code} (Patient isolation blocked cross-patient access)"

# 5. Patient History
def test_5():
    url = f'{base_url}/api/v1/patients/PAT-1025/history'
    req = urllib.request.Request(url,
        headers={'X-User-Role': 'patient', 'X-Patient-Id': 'PAT-1025', 'bypass-tunnel-reminder': 'true'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return f"{resp.status} - Patient profile retrieved"

# 6. Lab Queue
def test_6():
    url = f'{base_url}/api/v1/lab/queue'
    req = urllib.request.Request(url,
        headers={'X-User-Role': 'lab', 'bypass-tunnel-reminder': 'true'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return f"{resp.status} - Lab Queue retrieved"

# 7. Insurance Policy
def test_7():
    url = f'{base_url}/api/v1/insurance/policies/POL-725?patient_id=PAT-1025'
    req = urllib.request.Request(url,
        headers={'X-User-Role': 'insurance', 'bypass-tunnel-reminder': 'true'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return f"{resp.status} - Insurance Policy retrieved"

# 8. Nurse Tasks
def test_8():
    url = f'{base_url}/api/v1/nurse/tasks?nurse_id=NURSE-01'
    req = urllib.request.Request(url,
        headers={'X-User-Role': 'nurse', 'bypass-tunnel-reminder': 'true'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return f"{resp.status} - Nurse Tasks retrieved"

# 9. Admin Operations
def test_9():
    url = f'{base_url}/api/v1/admin/operations?hospital_id=HOSP-001'
    req = urllib.request.Request(url,
        headers={'X-User-Role': 'admin', 'bypass-tunnel-reminder': 'true'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return f"{resp.status} - Admin Operations retrieved"

# 10. Assistant Dispatch Orchestrator
def test_10():
    url = f'{base_url}/api/v1/workbench/dispatch'
    payload = {
        'agent_target': 'assistant',
        'action': 'interpret_request',
        'payload': {
            'message': 'Book me with Dr. Mehta tomorrow at 10 AM.',
            'user_role': 'patient',
            'caller_patient_id': 'PAT-1025',
            'patient_id': 'PAT-1025'
        },
        'portal_source': 'patient'
    }
    req = urllib.request.Request(url,
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        return f"{resp.status} - Target: {data.get('target_agent')}, Action: {data.get('action_performed')}"

print("Running test suite...")
test_endpoint("1. Appointment Availability", test_1)
test_endpoint("2. Invalid Doctor Fallback", test_2)
test_endpoint("3. Missing Patient Context Validation", test_3)
test_endpoint("4. Cross-Patient RBAC Isolation", test_4)
test_endpoint("5. Patient History Retrieval", test_5)
test_endpoint("6. Lab Queue Retrieval", test_6)
test_endpoint("7. Insurance Policy Lookup", test_7)
test_endpoint("8. Nurse Tasks Retrieval", test_8)
test_endpoint("9. Admin Operations Endpoint", test_9)
test_endpoint("10. Assistant Dispatch Orchestrator", test_10)
