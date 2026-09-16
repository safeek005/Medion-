from typing import Dict, Any, List
from app.services.mock_db import mock_db

class AdminService:
    def get_operations_summary(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        hospital_id = payload.get("hospital_id", "HOSP-001")
        
        # In a real scenario, this would aggregate data across collections
        patients = mock_db.get_collection("patients")
        doctors = mock_db.get_collection("doctors")
        appointments = mock_db.get_collection("appointments")
        
        active_appointments = [a for a in appointments if a.get("status") in ["SCHEDULED", "CONFIRMED"]]
        
        return {
            "success": True,
            "hospital_id": hospital_id,
            "summary": {
                "total_patients": len(patients),
                "total_doctors": len(doctors),
                "active_appointments": len(active_appointments),
                "occupancy_rate": "78%", # Mocked
                "critical_alerts": 3 # Mocked
            },
            "message": f"Operations summary retrieved for {hospital_id}"
        }

    def get_audit_logs(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        limit = payload.get("limit", 50)
        # Assuming we create an audit_logs collection in mock_db
        logs = mock_db.get_collection("audit_logs")
        
        # Sort by timestamp desc and take limit
        sorted_logs = sorted(logs, key=lambda x: x.get("timestamp", ""), reverse=True)[:limit]
        
        return {
            "success": True,
            "count": len(sorted_logs),
            "logs": sorted_logs,
            "message": "Audit logs retrieved"
        }

admin_service = AdminService()
