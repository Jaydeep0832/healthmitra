from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class SchemeVerificationStatus(str, Enum):
    ACTIVE = "Active"
    VERIFIED = "Verified"
    UNDER_REVIEW = "Under Review"
    EXPIRED = "Expired"

class SchemeCategory(str, Enum):
    ALL = "all"
    OPERATIONS_SURGERY = "operations_surgery"
    OPD = "opd"
    HOSPITALIZATION = "hospitalization"
    CRITICAL_ILLNESS = "critical_illness"
    MEDICINES_DIAGNOSTICS = "medicines_diagnostics"
    MATERNITY_CHILD = "maternity_child"
    CHRONIC_DISEASES = "chronic_diseases"

class IssuingAuthorityType(str, Enum):
    CENTRAL = "Central Government"
    STATE = "State Government"
    JOINT = "Central & State Joint"

class ClaimStatus(str, Enum):
    ACTIVE = "active"
    VERIFIED = "verified"
    SETTLED = "settled"
    REJECTED = "rejected"

class ClaimType(str, Enum):
    CASHLESS = "Cashless Hospitalization"
    REIMBURSEMENT = "Reimbursement"
    GOVT_PREAUTH = "Government Scheme Direct Pre-Auth"

class ClaimVerificationSource(str, Enum):
    OFFICIAL_TPA = "Official TPA / PM-JAY API (Verified)"
    USER_SUBMITTED = "User Submitted (Unverified)"

class HealthScheme(BaseModel):
    id: str
    name: str
    name_localized: Dict[str, str] = Field(default_factory=dict, description="Translations for scheme name (gu, hi, mr, bn, ta, te)")
    short_description: str
    description_localized: Dict[str, str] = Field(default_factory=dict)
    issuing_authority: IssuingAuthorityType
    state_jurisdiction: str = Field(default="All India", description="State name or 'All India' for central schemes")
    categories: List[SchemeCategory]
    coverage_amount: str
    coverage_amount_num: int = Field(default=500000, description="Numeric coverage in INR for filtering")
    income_limit: str
    income_limit_max: Optional[int] = Field(default=None, description="Max annual family income in INR, None if no income cap")
    eligibility_criteria: List[str]
    benefits: Optional[List[str]] = Field(default_factory=list, description="Key benefits provided")
    covered_treatments: List[str]
    required_documents: List[str]
    how_to_apply: Optional[str] = Field(default=None, description="Step-by-step application instructions")
    application_link: str
    helpline_number: str
    verification_status: SchemeVerificationStatus = SchemeVerificationStatus.VERIFIED
    last_verified_on: str = Field(..., description="YYYY-MM-DD date when information was last verified")
    verified_by: str = Field(default="National Health Authority / State Health Mission")
    middle_class_friendly: bool = Field(default=True, description="Highlighted for middle-class accessibility")
    verification_flag: Optional[str] = Field(default=None, description="Flag for any details requiring verification")

class InsurancePolicy(BaseModel):
    id: str
    policy_name: str
    provider: str
    category: str = Field(default="Standard Health Insurance")
    premium_range: str
    sum_insured_range: str
    key_coverage: List[str]
    waiting_periods: str
    claim_settlement_ratio: str
    entry_age: str
    official_link: str
    verification_status: SchemeVerificationStatus = SchemeVerificationStatus.VERIFIED
    last_verified_on: str
    irdai_registration: str

class PatientClaim(BaseModel):
    id: str
    claim_reference: str
    scheme_or_policy: str
    patient_name: str
    hospital_name: str
    claim_type: ClaimType
    amount_claimed: float
    amount_approved: Optional[float] = None
    status: ClaimStatus
    source: ClaimVerificationSource
    is_verified: bool
    submitted_date: str
    last_updated: str
    next_steps: str
    notes: Optional[str] = None

class ClaimCreateRequest(BaseModel):
    scheme_or_policy: str
    patient_name: str
    hospital_name: str
    claim_type: ClaimType
    amount_claimed: float
    claim_reference: Optional[str] = None
    notes: Optional[str] = None

class EligibilityCheckRequest(BaseModel):
    state: str = Field(default="Gujarat")
    annual_income: float = Field(..., description="Annual family income in INR")
    age: int = Field(..., description="Patient age")
    illness_type: Optional[str] = Field(default=None, description="e.g. Cardiology, Cancer, Maternity, Surgery, etc.")
    category: Optional[str] = Field(default="General", description="General, BPL, Senior Citizen, Pregnant Woman, Differently Abled")
    family_members: Optional[int] = Field(default=4)

class EligibilityMatch(BaseModel):
    scheme: HealthScheme
    match_score: int = Field(..., description="Match percentage (0-100)")
    is_eligible: bool
    matching_reasons: List[str]
    warning_notes: Optional[List[str]] = None
