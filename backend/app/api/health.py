from fastapi import APIRouter
from app.models.common import BaseAPIResponse
from datetime import datetime

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=BaseAPIResponse)
def get_health_status():
    return BaseAPIResponse(
        success=True,
        message="MEDION AGENT Backend API is healthy and operational",
        data={
            "status": "UP",
            "phase": "Phase 1 - Foundation",
            "agents_registered": [
                "Patient Agent",
                "Medical Agent",
                "Appointment Agent",
                "Insurance Agent",
                "Assistant Agent"
            ],
            "environment": "development"
        }
    )
