import httpx
import json

def run_tests():
    # Test both tunnel and local endpoints
    endpoints = [
        ("Public Tunnel Endpoint", "https://2dfaad77abf869.lhr.life/api/v1/workbench/dispatch"),
        ("Localhost Port 8000", "http://127.0.0.1:8000/api/v1/workbench/dispatch")
    ]
    
    tests = [
        {
            'name': '1. Patient Request (get_patient: PAT-1001)',
            'payload': {
                'workflow_id': 'WF-E2E-PATIENT-101',
                'agent_target': 'patient',
                'action': 'get_patient',
                'portal_source': 'doctor',
                'payload': {'patient_id': 'PAT-1001'}
            }
        },
        {
            'name': '2. Medical Request (analyze_lab_report: LABR-1001)',
            'payload': {
                'workflow_id': 'WF-E2E-MEDICAL-102',
                'agent_target': 'medical',
                'action': 'analyze_lab_report',
                'portal_source': 'doctor',
                'payload': {'report_id': 'LABR-1001'}
            }
        },
        {
            'name': '3. Appointment Request (get_available_slots: DOC-101)',
            'payload': {
                'workflow_id': 'WF-E2E-APPOINT-103',
                'agent_target': 'appointment',
                'action': 'get_available_slots',
                'portal_source': 'patient',
                'payload': {'doctor_id': 'DOC-101'}
            }
        },
        {
            'name': '4. Insurance Request (verify_insurance: PAT-1001)',
            'payload': {
                'workflow_id': 'WF-E2E-INSURE-104',
                'agent_target': 'insurance',
                'action': 'verify_insurance',
                'portal_source': 'nurse',
                'payload': {'patient_id': 'PAT-1001'}
            }
        },
        {
            'name': '5. Assistant Request (Natural Language: Summarize latest lab report for PAT-1001)',
            'payload': {
                'workflow_id': 'WF-E2E-ASSIST-105',
                'agent_target': 'assistant',
                'action': 'interpret_request',
                'portal_source': 'doctor',
                'payload': {
                    'message': "Summarize this patient's latest lab report.",
                    'patient_id': 'PAT-1001'
                }
            }
        }
    ]

    for label, url in endpoints:
        print(f"\n######################################################################")
        print(f"TESTING ENDPOINT: {label} ({url})")
        print(f"######################################################################")
        
        all_passed = True
        for test in tests:
            print(f"\n--- {test['name']} ---")
            try:
                res = httpx.post(url, json=test['payload'], timeout=15.0)
                if res.status_code == 200:
                    data = res.json()
                    print(f"[STATUS] HTTP 200 OK")
                    print(f"Workflow ID: {data.get('workflow_id')}")
                    print(f"Target Agent: {data.get('target_agent')}")
                    print(f"Action Performed: {data.get('action_performed')}")
                    summary = data.get('output', {}).get('summary') if isinstance(data.get('output'), dict) else str(data.get('output'))[:120]
                    print(f"Summary: {summary}")
                else:
                    all_passed = False
                    print(f"[FAIL] HTTP {res.status_code}: {res.text}")
            except Exception as e:
                all_passed = False
                print(f"[ERROR] Request failed: {e}")

        print(f"\n>> {label} Result: {'ALL 5 PASSED [SUCCESS]' if all_passed else 'FAILED'}")

if __name__ == '__main__':
    run_tests()
