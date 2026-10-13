import json
import logging
import re
from io import BytesIO
from typing import Literal, Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field

from app.config import settings
from app.security.roles import get_current_user
from app.services.llm_service import llm_service
from app.security.rate_limit import llm_rate_limiter

try:
    import fitz
    from PIL import Image
    import pytesseract
    Image.MAX_IMAGE_PIXELS = 20_000_000
except ImportError:
    fitz = None
    Image = None
    pytesseract = None

logger = logging.getLogger(__name__)

router = APIRouter()

class Biomarker(BaseModel):
    name: str
    value: str
    unit: Optional[str] = None
    reference_range: str
    status: Literal["NORMAL", "HIGH", "LOW", "ABNORMAL"]
    clinical_note: str

class ReportAnalysisResponse(BaseModel):
    title: str
    risk_level: Literal["HIGH", "MODERATE", "LOW"]
    risk_color: Literal["red", "amber", "emerald"]
    patient_summary: str
    biomarkers: List[Biomarker]
    critical_findings: List[str]
    questions_for_doctor: List[str]
    lifestyle_recommendations: List[str]
    disclaimer: str

class TextReportInput(BaseModel):
    report_text: str = Field(..., min_length=1, max_length=10000, description="Raw text or copied values from lab report")
    language: Literal["en", "hi", "gu", "mr", "bn"] = Field(default="en", description="Target language")

CLINICAL_PARAM_RULES = [
    {
        "pattern": r"(?:hemoglobin|hb)\b[:\s]*([\d\.]+)\s*(?:g\/dl)?",
        "name": "Hemoglobin",
        "unit": "g/dL",
        "ref_range": "12.0 - 16.0",
        "low": 12.0, "high": 16.0,
        "note_high": "Elevated hemoglobin may indicate dehydration or erythrocytosis.",
        "note_low": "Low hemoglobin indicates mild to moderate anemia. Iron and ferritin review recommended.",
        "note_normal": "Optimal red cell oxygen carrying capacity within reference boundaries."
    },
    {
        "pattern": r"(?:wbc|wbc count|white blood cell|tlc)\b[:\s]*([\d,\.]+)\s*(?:\/mcl|\/cumm)?",
        "name": "White Blood Cell Count (WBC)",
        "unit": "/mcL",
        "ref_range": "4,500 - 11,000",
        "low": 4500, "high": 11000,
        "note_high": "Elevated leukocyte count suggests systemic infection, inflammation, or immune stress.",
        "note_low": "Low WBC count (leukopenia) may increase vulnerability to infections.",
        "note_normal": "Immune white cell count is within expected normal baseline."
    },
    {
        "pattern": r"(?:platelet|platelets|platelet count)\b[:\s]*([\d,\.]+)\s*(?:\/mcl|\/cumm)?",
        "name": "Platelet Count",
        "unit": "/mcL",
        "ref_range": "150,000 - 450,000",
        "low": 150000, "high": 450000,
        "note_high": "Thrombocytosis. Consult physician to assess reactive causes.",
        "note_low": "Thrombocytopenia (low platelets). Monitor for bruising or fever etiology like Dengue/Malaria.",
        "note_normal": "Platelet aggregation count within healthy clotting parameters."
    },
    {
        "pattern": r"(?:rbc|rbc count|red blood cell)\b[:\s]*([\d\.]+)\s*(?:million\/mcl)?",
        "name": "Red Blood Cell Count (RBC)",
        "unit": "million/mcL",
        "ref_range": "4.2 - 5.4",
        "low": 4.2, "high": 5.4,
        "note_high": "Elevated RBC count.",
        "note_low": "Low RBC count consistent with anemia or blood loss.",
        "note_normal": "Red cell morphology and baseline count within limits."
    },
    {
        "pattern": r"(?:fasting blood sugar|fasting glucose|fbs)\b[:\s]*([\d\.]+)\s*(?:mg\/dl)?",
        "name": "Fasting Blood Sugar (FBS)",
        "unit": "mg/dL",
        "ref_range": "70 - 99",
        "low": 70, "high": 100,
        "note_high": "Elevated fasting blood glucose. Values between 100-125 indicate prediabetes, >=126 indicates diabetes.",
        "note_low": "Hypoglycemia risk. Fasting sugar is below baseline.",
        "note_normal": "Optimal fasting glycemic control."
    },
    {
        "pattern": r"(?:post[- ]prandial glucose|ppbs|post[- ]prandial)\b[:\s]*([\d\.]+)\s*(?:mg\/dl)?",
        "name": "Post-Prandial Blood Sugar (PPBS)",
        "unit": "mg/dL",
        "ref_range": "< 140",
        "low": 60, "high": 140,
        "note_high": "Elevated post-meal blood sugar. Suggests impaired glucose tolerance or insulin resistance.",
        "note_low": "Low post-meal glucose.",
        "note_normal": "Post-prandial glycemic response within normal range."
    },
    {
        "pattern": r"(?:hba1c|glycated hemoglobin)\b[:\s]*([\d\.]+)\s*%?",
        "name": "Glycated Hemoglobin (HbA1c)",
        "unit": "%",
        "ref_range": "< 5.7",
        "low": 4.0, "high": 5.7,
        "note_high": "HbA1c > 5.7% indicates prediabetes/diabetes over the past 90 days. Diabetologist consult advised.",
        "note_low": "Low HbA1c.",
        "note_normal": "Excellent 3-month average blood glucose control."
    },
    {
        "pattern": r"(?:total cholesterol|cholesterol)\b[:\s]*([\d\.]+)\s*(?:mg\/dl)?",
        "name": "Total Cholesterol",
        "unit": "mg/dL",
        "ref_range": "< 200",
        "low": 100, "high": 200,
        "note_high": "Hypercholesterolemia. Elevated blood lipids increase cardiovascular risk.",
        "note_low": "Low cholesterol level.",
        "note_normal": "Total blood cholesterol is within desirable cardiac limits."
    },
    {
        "pattern": r"(?:ldl|ldl cholesterol)\b[:\s]*([\d\.]+)\s*(?:mg\/dl)?",
        "name": "LDL Cholesterol (Bad Cholesterol)",
        "unit": "mg/dL",
        "ref_range": "< 100",
        "low": 50, "high": 100,
        "note_high": "Elevated LDL atherogenic particles. Diet modification and lipid lowering therapy review needed.",
        "note_low": "Optimal low atherogenic risk.",
        "note_normal": "Optimal LDL level for arterial health."
    },
    {
        "pattern": r"(?:hdl|hdl cholesterol)\b[:\s]*([\d\.]+)\s*(?:mg\/dl)?",
        "name": "HDL Cholesterol (Good Cholesterol)",
        "unit": "mg/dL",
        "ref_range": "> 40",
        "low": 40, "high": 100,
        "note_high": "Protective high HDL levels.",
        "note_low": "Low HDL reduces cardiovascular protection. Regular aerobic exercise and healthy fats help.",
        "note_normal": "Adequate HDL cardiac protective level."
    },
    {
        "pattern": r"(?:triglycerides|tg)\b[:\s]*([\d\.]+)\s*(?:mg\/dl)?",
        "name": "Triglycerides",
        "unit": "mg/dL",
        "ref_range": "< 150",
        "low": 50, "high": 150,
        "note_high": "Elevated blood triglycerides. Restrict simple sugars, fried foods, and alcohol.",
        "note_low": "Low triglyceride level.",
        "note_normal": "Triglycerides within normal metabolic range."
    },
    {
        "pattern": r"(?:serum creatinine|creatinine)\b[:\s]*([\d\.]+)\s*(?:mg\/dl)?",
        "name": "Serum Creatinine",
        "unit": "mg/dL",
        "ref_range": "0.7 - 1.3",
        "low": 0.7, "high": 1.3,
        "note_high": "Elevated creatinine indicates potential renal filtration stress or acute dehydration.",
        "note_low": "Low creatinine, commonly linked with lower muscle mass.",
        "note_normal": "Optimal kidney filtration function."
    }
]

def _fallback_clinical_analysis(input_data: TextReportInput) -> ReportAnalysisResponse:
    """Deterministic, rule-based clinical diagnostic parser for Indian lab reports."""
    text = input_data.report_text
    lang = input_data.language
    biomarkers: List[Biomarker] = []
    critical_findings: List[str] = []
    high_count = 0

    for rule in CLINICAL_PARAM_RULES:
        match = re.search(rule["pattern"], text, re.IGNORECASE)
        if match:
            raw_val_str = match.group(1).replace(",", "")
            try:
                val = float(raw_val_str)
            except ValueError:
                continue

            if val > rule["high"]:
                status_val = "HIGH"
                note = rule["note_high"]
                high_count += 1
                critical_findings.append(f"{rule['name']} is elevated at {match.group(1)} {rule['unit']} (Ref: {rule['ref_range']}).")
            elif val < rule["low"]:
                status_val = "LOW"
                note = rule["note_low"]
                high_count += 1
                critical_findings.append(f"{rule['name']} is below normal at {match.group(1)} {rule['unit']} (Ref: {rule['ref_range']}).")
            else:
                status_val = "NORMAL"
                note = rule["note_normal"]

            biomarkers.append(
                Biomarker(
                    name=rule["name"],
                    value=match.group(1),
                    unit=rule["unit"],
                    reference_range=rule["ref_range"],
                    status=status_val,
                    clinical_note=note
                )
            )

    # Generic fallback if no specific biomarker pattern was found in raw text
    if not biomarkers:
        biomarkers.append(
            Biomarker(
                name="Clinical Text Evaluation",
                value="Document Received",
                unit="text",
                reference_range="Patient specific",
                status="NORMAL",
                clinical_note="General test document parsed. Review findings with clinical staff."
            )
        )

    # Determine risk level
    if high_count >= 2:
        risk_level = "HIGH"
        risk_color = "red"
    elif high_count == 1:
        risk_level = "MODERATE"
        risk_color = "amber"
    else:
        risk_level = "LOW"
        risk_color = "emerald"

    # Multilingual summaries
    summaries = {
        "gu": f"તમારા લૅબ રિપોર્ટના પરિણામોનું સફળતાપૂર્વક વિશ્લેષણ કરવામાં આવ્યું છે. {len(biomarkers)} બાયોમાર્કર્સ ચકાસાયા છે, જેમાંથી {high_count} પરિમાણો સામાન્ય શ્રેણી બહાર છે.",
        "hi": f"आपकी लैब रिपोर्ट का सफलतापूर्वक विश्लेषण किया गया है। {len(biomarkers)} बायोमार्कर्स की जांच की गई, जिसमें {high_count} पैरामीटर सामान्य सीमा से बाहर हैं।",
        "mr": f"तुमच्या लॅब रिपोर्टचे यशस्वीरित्या विश्लेषण केले आहे. {len(biomarkers)} बायोमार्कर्स तपासले गेले, त्यापैकी {high_count} सामान्य श्रेणीच्या बाहेर आहेत.",
        "bn": f"আপনার ল্যাব রিপোর্টের সফলভাবে বিশ্লেষণ করা হয়েছে। {len(biomarkers)} টি বায়োমার্কার পরীক্ষা করা হয়েছে, যার মধ্যে {high_count} টি সাধারণ সীমার বাইরে।",
        "en": f"Diagnostic report parsed with {len(biomarkers)} biomarkers mapped against standard Indian clinical reference intervals. {high_count} parameters fall outside baseline ranges."
    }
    summary = summaries.get(lang, summaries["en"])

    # Questions for doctor
    questions = [
        "What clinical factors could be contributing to my abnormal parameter values?",
        "Do I require repeat testing or any supplementary confirmatory imaging?",
        "Should we initiate medication or adjust dietary and exercise routines first?"
    ]

    # Lifestyle recommendations
    recommendations = [
        "Maintain adequate hydration with 2.5-3 liters of clean drinking water daily.",
        "Incorporate 30 minutes of brisk walking or moderate aerobic exercise 5 days a week.",
        "Reduce refined carbohydrates, trans-fats, and maintain a balanced high-fiber diet.",
        "Schedule a comprehensive review with a primary care physician within 7-10 days."
    ]

    return ReportAnalysisResponse(
        title="Comprehensive Diagnostic Panel Analysis",
        risk_level=risk_level,
        risk_color=risk_color,
        patient_summary=summary,
        biomarkers=biomarkers,
        critical_findings=critical_findings or ["All measured parameters are within standard physiological limits."],
        questions_for_doctor=questions,
        lifestyle_recommendations=recommendations,
        disclaimer="This report interpretation is generated by HealthMitra AI for educational awareness. Always consult your attending doctor for clinical diagnosis and treatment."
    )

async def _analyze_report_text(input_data: TextReportInput) -> ReportAnalysisResponse:
    prompt = f"""You are HealthMitra's AI Medical Report Analyzer for Indian clinical diagnostics.
Analyze the following patient lab report / diagnostic text:
"{input_data.report_text}"
Language requested: {input_data.language}

Extract key biomarkers, compare with standard reference ranges, and translate complex findings into accessible, compassionate explanations.

Respond ONLY with a JSON object with this exact schema:
{{
    "title": "Report Title (e.g. Complete Blood Count / Lipid Profile / Blood Glucose Evaluation)",
    "risk_level": "HIGH" or "MODERATE" or "LOW",
    "risk_color": "red" (if high risk) or "amber" (if moderate) or "emerald" (if low risk),
    "patient_summary": "Comprehensive 2-3 sentence overview explaining what these test results mean in {input_data.language}",
    "biomarkers": [
        {{
            "name": "Parameter Name (e.g. Hemoglobin, Fasting Blood Sugar, Total Cholesterol)",
            "value": "Measured Value (e.g. 11.2)",
            "unit": "Unit (e.g. g/dL, mg/dL)",
            "reference_range": "Normal Reference Range (e.g. 13.0 - 17.0)",
            "status": "NORMAL" or "HIGH" or "LOW" or "ABNORMAL",
            "clinical_note": "Short explanation in {input_data.language} of what this specific number means"
        }}
    ],
    "critical_findings": ["Key observation 1", "Key observation 2"],
    "questions_for_doctor": [
        "Specific question patient should ask doctor 1",
        "Specific question 2",
        "Specific question 3"
    ],
    "lifestyle_recommendations": [
        "Dietary or lifestyle action 1",
        "Dietary or lifestyle action 2"
    ],
    "disclaimer": "This analysis is generated by AI for educational understanding and must be reviewed by a certified medical practitioner."
}}
"""

    if settings.GROQ_API_KEY and llm_service.client:
        try:
            completion = await llm_service.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=llm_service.model,
                response_format={"type": "json_object"}
            )
            raw_content = completion.choices[0].message.content
            parsed = json.loads(raw_content)
            return ReportAnalysisResponse.model_validate(parsed)
        except Exception as exc:
            logger.warning(f"Groq report analysis failed ({exc}), falling back to clinical parser")

    # Fallback to deterministic clinical parser
    return _fallback_clinical_analysis(input_data)


@router.post("/analyze-text", response_model=ReportAnalysisResponse)
async def analyze_report_text(
    input_data: TextReportInput,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(llm_rate_limiter),
):
    """Analyze report text with structured, validated output."""
    return await _analyze_report_text(input_data)


def _extract_document_text(content: bytes, content_type: str) -> str:
    if content_type == "application/pdf":
        if fitz is None or Image is None or pytesseract is None:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="PDF extraction dependencies are not installed.",
            )
        if not content.startswith(b"%PDF"):
            raise HTTPException(status_code=400, detail="The uploaded file is not a valid PDF.")

        try:
            document = fitz.open(stream=content, filetype="pdf")
        except Exception as exc:
            raise HTTPException(status_code=400, detail="The uploaded PDF could not be opened.") from exc
        try:
            text = "\n".join(page.get_text() for page in document).strip()
            if text:
                return text[:10000]

            ocr_chunks = []
            try:
                for page in list(document)[:5]:
                    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                    image = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
                    ocr_chunks.append(pytesseract.image_to_string(image, lang="eng"))
            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="The uploaded PDF could not be processed for text extraction.",
                ) from exc
            return "\n".join(ocr_chunks).strip()[:10000]
        finally:
            document.close()

    if Image is None or pytesseract is None:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Image extraction dependencies are not installed.",
        )

    try:
        image = Image.open(BytesIO(content))
        image.verify()
        image = Image.open(BytesIO(content)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="The uploaded image is invalid.") from exc

    try:
        return pytesseract.image_to_string(image, lang="eng").strip()[:10000]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The uploaded image could not be processed for text extraction.",
        ) from exc


@router.post("/upload")
async def upload_file_report(
    file: UploadFile = File(...),
    language: Literal["en", "hi", "gu", "mr", "bn"] = Form(default="en"),
    current_user: dict = Depends(get_current_user),
    _: None = Depends(llm_rate_limiter),
):
    """Extract text from a PDF/image and analyze it without persisting the upload."""
    allowed_types = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=415, detail="Upload a PDF, JPEG, PNG, or WebP file.")

    content = await file.read(10 * 1024 * 1024 + 1)
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds the 10 MB limit.")

    extracted_text = _extract_document_text(content, file.content_type)
    if not extracted_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No readable text was found in the uploaded document.",
        )

    return await _analyze_report_text(
        TextReportInput(report_text=extracted_text, language=language)
    )
