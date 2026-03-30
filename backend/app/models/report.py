from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class ReportModel(BaseModel):
    user_id: str
    file_name: str
    file_type: str  # pdf, image
    file_url: Optional[str] = ""
    document_type: str = ""  # lab_report, prescription, discharge_summary, xray
    extracted_text: str = ""
    extracted_data: Dict = {}
    ai_summary: str = ""
    findings: List[str] = []
    medicines_found: List[str] = []
    abnormal_values: List[Dict[str, str]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ReportResponse(BaseModel):
    id: str
    user_id: str
    file_name: str
    file_type: str
    document_type: str
    extracted_text: str
    ai_summary: str
    findings: List[str]
    medicines_found: List[str]
    abnormal_values: List[Dict[str, str]]
    created_at: Optional[str] = None