from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.common import BaseAPIResponse
from app.services.mock_db import mock_db

router = APIRouter(prefix="/mock-data", tags=["Mock Data"])

@router.get("/{collection_name}", response_model=BaseAPIResponse)
def get_mock_collection(collection_name: str, search: Optional[str] = Query(None)):
    if collection_name == "patients" and search:
        data = mock_db.search_patients(search)
    else:
        data = mock_db.get_collection(collection_name)
    
    if not data and collection_name not in [
        "patients", "doctors", "nurses", "hospitals", "laboratories",
        "insurance_providers", "insurance_policies", "appointments",
        "medical_records", "lab_reports", "prescriptions", "bills",
        "insurance_claims", "notifications"
    ]:
        raise HTTPException(status_code=404, detail=f"Collection '{collection_name}' not found")
        
    return BaseAPIResponse(
        success=True,
        message=f"Retrieved {len(data)} items from '{collection_name}'",
        data=data
    )

@router.get("/{collection_name}/{key}/{value}", response_model=BaseAPIResponse)
def get_mock_item(collection_name: str, key: str, value: str):
    item = mock_db.find_one(collection_name, key, value)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item with {key}='{value}' not found in {collection_name}")
    return BaseAPIResponse(
        success=True,
        message=f"Retrieved item from '{collection_name}'",
        data=item
    )
