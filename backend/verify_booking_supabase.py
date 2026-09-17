import urllib.request
import json

book_url = 'https://fair-roses-arrive.loca.lt/api/v1/appointments/book'
payload = {
    'patient_id': 'PAT-1025',
    'doctor_id': 'DOC-101',
    'appointment_date': '2026-10-20',
    'time_slot': '14:00-14:30',
    'reason_for_visit': 'Cardiology consultation'
}
req = urllib.request.Request(book_url, data=json.dumps(payload).encode(), headers={
    'Content-Type': 'application/json',
    'X-User-Role': 'patient',
    'X-Patient-Id': 'PAT-1025',
    'bypass-tunnel-reminder': 'true'
})
res = urllib.request.urlopen(req, timeout=10)
data = json.loads(res.read().decode())
apt_id = data.get('appointment_id')
print('Booking API status:', res.status, 'Appointment ID:', apt_id)

# Query Supabase V2
supabase_key = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_h1gg8lGZR7ABgbqaDoMkNw_qBoq_5IN")
url = f'https://cvjjumwflwjwqyqgymqs.supabase.co/rest/v1/appointments?appointment_id=eq.{apt_id}'
headers = {
    'apikey': supabase_key,
    'Authorization': f'Bearer {supabase_key}'
}
req2 = urllib.request.Request(url, headers=headers)
resp2 = urllib.request.urlopen(req2)
rows = json.loads(resp2.read().decode())
print('Found in Supabase V2:', len(rows))
if rows:
    print('Row from Supabase V2:', rows[0])
