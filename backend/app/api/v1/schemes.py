from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.models.scheme import (
    HealthScheme,
    InsurancePolicy,
    PatientClaim,
    ClaimCreateRequest,
    EligibilityCheckRequest,
    EligibilityMatch,
)
from app.services.scheme_service import scheme_service

router = APIRouter()

@router.get("", response_model=List[HealthScheme], summary="List all government health schemes")
async def get_schemes(
    category: Optional[str] = Query(default="all", description="Category filter (operations_surgery, opd, hospitalization, etc.)"),
    state: Optional[str] = Query(default=None, description="State filter (e.g. Gujarat, Maharashtra, All India)"),
    search: Optional[str] = Query(default=None, description="Search keyword in scheme name or treatments"),
    middle_class_only: bool = Query(default=False, description="Filter for schemes accessible to middle-class citizens")
):
    """Retrieve verified government schemes with categorization and search filtering."""
    return await scheme_service.get_schemes(
        category=category,
        state=state,
        search_query=search,
        middle_class_only=middle_class_only
    )

@router.get("/insurance-policies", response_model=List[InsurancePolicy], summary="List affordable health insurance policies")
async def get_insurance_policies():
    """Retrieve verified affordable health insurance policies suited for middle-class families."""
    return await scheme_service.get_insurance_policies()

@router.get("/claims", response_model=List[PatientClaim], summary="List patient claims with verification status")
async def get_claims(
    patient_name: Optional[str] = Query(default=None, description="Filter by patient name")
):
    """Retrieve claims with official TPA verified vs user-submitted unverified distinction."""
    return await scheme_service.get_claims(patient_name=patient_name)

@router.post("/claims", response_model=PatientClaim, status_code=status.HTTP_201_CREATED, summary="Submit a claim for tracking")
async def submit_claim(request: ClaimCreateRequest):
    """Submit a claim to be tracked. User-submitted claims are tagged as Unverified until verified by TPA."""
    return await scheme_service.track_claim(request)

@router.post("/check-eligibility", response_model=List[EligibilityMatch], summary="Check scheme eligibility")
async def check_eligibility(query: EligibilityCheckRequest):
    """Smart assessment algorithm returning matching schemes and match scores based on patient profile."""
    return await scheme_service.check_eligibility(query)

@router.get("/{scheme_id}", response_model=HealthScheme, summary="Get scheme by ID")
async def get_scheme_by_id(scheme_id: str):
    """Retrieve detailed scheme metadata, covered treatments, and documents required."""
    scheme = await scheme_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health scheme '{scheme_id}' not found"
        )
    return scheme
