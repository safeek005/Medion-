import httpx
import json

def run_nlp_tests():
    url = 'http://127.0.0.1:8000/api/v1/workbench/dispatch'
    queries = [
        ("1. Lab Report Analysis", "Analyze Arun Kumar's latest laboratory report (LABR-1001)", "doctor"),
        ("2. Patient Lookup", "Show patient PAT-1001", "doctor"),
        ("3. Doctor Available Slots", "What appointments are available for DOC-101?", "patient"),
        ("4. Insurance Eligibility", "Check insurance eligibility for PAT-1001", "nurse"),
        ("5. Medical Summary", "Summarize this patient's latest lab report.", "doctor")
    ]

    for label, query, role in queries:
        print(f"\n======================================================================")
        print(f"QUERY: {label}")
        print(f"User Input: \"{query}\" (Role: {role})")
        print(f"======================================================================")
        
        payload = {
            'workflow_id': f'WF-NLP-{Date_tag(label)}',
            'agent_target': 'assistant',
            'action': 'interpret_request',
            'portal_source': role,
            'payload': {
                'message': query,
                'patient_id': 'PAT-1001'
            }
        }
        
        r = httpx.post(url, json=payload, timeout=10.0)
        data = r.json()
        print(f"[HTTP {r.status_code}] Target: {data.get('target_agent')} | Action: {data.get('action_performed')}")
        output = data.get('output', {})
        print(f"\nOutput Summary:\n{output.get('summary')}\n")

def Date_tag(s):
    return s.split(".")[0].strip()

if __name__ == '__main__':
    run_nlp_tests()
