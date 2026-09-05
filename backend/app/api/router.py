from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.mock_data import router as mock_data_router
from app.api.workbench import router as workbench_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(mock_data_router)
api_router.include_router(workbench_router)
