"""
Appointment Agent Package (RULE / DATA)
Responsible for:
- Doctor availability slots
- Appointment booking & confirmation
- Cancellation & rescheduling
- Appointment reminders & follow-ups
"""
from app.agents.base import BaseAgent
from app.models.common import AgentType
from app.agents.appointment.service import appointment_service
from typing import Dict, Any

class AppointmentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="AGENT-APPOINTMENT-03",
            agent_name="Appointment Agent",
            agent_type=AgentType.RULE
        )

    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        action_clean = action.lower().strip()
        if action_clean == "get_available_slots":
            return appointment_service.get_available_slots(payload)
        elif action_clean == "book_appointment":
            return appointment_service.book_appointment(payload)
        elif action_clean == "get_appointment":
            return appointment_service.get_appointment(payload)
        elif action_clean == "cancel_appointment":
            return appointment_service.cancel_appointment(payload)
        elif action_clean == "reschedule_appointment":
            return appointment_service.reschedule_appointment(payload)
        else:
            raise ValueError(
                f"Action '{action}' is not supported by Appointment Agent. "
                "Supported actions: get_available_slots, book_appointment, get_appointment, cancel_appointment, reschedule_appointment."
            )

