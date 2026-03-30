from app.services.database import get_database
from bson import ObjectId
from datetime import datetime
import io
import re

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False


class ReportService:

    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        text = ""

        if PYMUPDF_AVAILABLE:
            try:
                doc = fitz.open(stream=file_content, filetype="pdf")
                for page in doc:
                    text += page.get_text()
                doc.close()
                return text
            except Exception as e:
                print(f"PyMuPDF extraction error: {e}")

        if PDFPLUMBER_AVAILABLE:
            try:
                pdf = pdfplumber.open(io.BytesIO(file_content))
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                pdf.close()
                return text
            except Exception as e:
                print(f"pdfplumber extraction error: {e}")

        return "Could not extract text from PDF. Please ensure the PDF contains readable text."

    def extract_text_from_image(self, file_content: bytes) -> str:
        """Extract text from image using basic analysis"""
        # For production, use Tesseract OCR or AWS Textract
        return "Image uploaded successfully. OCR text extraction requires Tesseract setup. Please upload PDF reports for text extraction."

    def classify_document(self, text: str) -> str:
        """Classify document type based on content"""
        text_lower = text.lower()

        if any(word in text_lower for word in ["hemoglobin", "rbc", "wbc", "platelet", "blood count", "cbc"]):
            return "lab_report"
        elif any(word in text_lower for word in ["prescription", "rx", "tab.", "cap.", "syrup"]):
            return "prescription"
        elif any(word in text_lower for word in ["discharge", "admitted", "discharged"]):
            return "discharge_summary"
        elif any(word in text_lower for word in ["x-ray", "xray", "radiograph", "ct scan", "mri"]):
            return "radiology_report"
        else:
            return "general_report"

    def extract_medical_data(self, text: str) -> dict:
        """Extract structured medical data from text"""
        data = {
            "patient_name": "",
            "doctor_name": "",
            "date": "",
            "medicines": [],
            "test_results": [],
            "diagnosis": [],
            "abnormal_values": []
        }

        lines = text.split("\n")

        # Extract patterns
        for line in lines:
            line_stripped = line.strip()

            # Patient name
            if "patient" in line.lower() and "name" in line.lower():
                data["patient_name"] = line_stripped.split(":")[-1].strip() if ":" in line_stripped else ""

            # Doctor name
            if "dr." in line.lower() or "doctor" in line.lower():
                data["doctor_name"] = line_stripped

            # Medicines
            if any(word in line.lower() for word in ["tab.", "cap.", "syrup", "injection", "mg"]):
                data["medicines"].append(line_stripped)

            # Test results with values
            hemoglobin = re.findall(r'hemoglobin[:\s]*(\d+\.?\d*)', line.lower())
            if hemoglobin:
                value = float(hemoglobin[0])
                result = {"test": "Hemoglobin", "value": str(value), "unit": "g/dL"}
                if value < 12:
                    result["status"] = "LOW"
                    data["abnormal_values"].append(result)
                data["test_results"].append(result)

            sugar = re.findall(r'(?:blood sugar|glucose|fasting)[:\s]*(\d+\.?\d*)', line.lower())
            if sugar:
                value = float(sugar[0])
                result = {"test": "Blood Sugar", "value": str(value), "unit": "mg/dL"}
                if value > 126:
                    result["status"] = "HIGH"
                    data["abnormal_values"].append(result)
                data["test_results"].append(result)

        return data

    def generate_summary(self, text: str, document_type: str, extracted_data: dict) -> str:
        """Generate simple language summary"""
        summary_parts = []

        summary_parts.append(f"📄 Document Type: {document_type.replace('_', ' ').title()}")

        if extracted_data.get("patient_name"):
            summary_parts.append(f"👤 Patient: {extracted_data['patient_name']}")

        if extracted_data.get("medicines"):
            summary_parts.append(f"💊 Medicines Found: {len(extracted_data['medicines'])}")
            for med in extracted_data["medicines"][:5]:
                summary_parts.append(f"  - {med}")

        if extracted_data.get("abnormal_values"):
            summary_parts.append("⚠️ Abnormal Values Found:")
            for val in extracted_data["abnormal_values"]:
                summary_parts.append(f"  - {val['test']}: {val['value']} {val.get('unit', '')} ({val.get('status', '')})")

        if extracted_data.get("test_results"):
            summary_parts.append(f"🔬 Test Results: {len(extracted_data['test_results'])} found")

        if not summary_parts or len(summary_parts) <= 1:
            summary_parts.append("Report processed. Please review the extracted text for details.")

        summary_parts.append("\n⚠️ Note: This is an AI-generated summary. Please consult your doctor for interpretation.")

        return "\n".join(summary_parts)

    async def process_report(
        self,
        user_id: str,
        file_name: str,
        file_content: bytes,
        file_type: str,
        document_type: str = "auto"
    ) -> dict:
        """Process uploaded medical report"""
        db = get_database()

        # Extract text
        if "pdf" in file_type.lower():
            extracted_text = self.extract_text_from_pdf(file_content)
        else:
            extracted_text = self.extract_text_from_image(file_content)

        # Auto-classify if needed
        if document_type == "auto":
            document_type = self.classify_document(extracted_text)

        # Extract structured data
        extracted_data = self.extract_medical_data(extracted_text)

        # Generate summary
        ai_summary = self.generate_summary(extracted_text, document_type, extracted_data)

        # Save to database
        report = {
            "user_id": user_id,
            "file_name": file_name,
            "file_type": file_type,
            "document_type": document_type,
            "extracted_text": extracted_text[:5000],  # Limit stored text
            "extracted_data": extracted_data,
            "ai_summary": ai_summary,
            "findings": extracted_data.get("test_results", []),
            "medicines_found": extracted_data.get("medicines", []),
            "abnormal_values": extracted_data.get("abnormal_values", []),
            "created_at": datetime.utcnow()
        }

        result = await db.reports.insert_one(report)

        return {
            "id": str(result.inserted_id),
            "user_id": user_id,
            "file_name": file_name,
            "file_type": file_type,
            "document_type": document_type,
            "extracted_text": extracted_text[:2000],
            "ai_summary": ai_summary,
            "findings": extracted_data.get("test_results", []),
            "medicines_found": extracted_data.get("medicines", []),
            "abnormal_values": extracted_data.get("abnormal_values", []),
            "created_at": str(datetime.utcnow())
        }

    async def get_user_reports(self, user_id: str) -> list:
        """Get all reports for a user"""
        db = get_database()
        reports = []

        async for report in db.reports.find(
            {"user_id": user_id}
        ).sort("created_at", -1):
            report["id"] = str(report.pop("_id"))
            report["created_at"] = str(report.get("created_at", ""))
            reports.append(report)

        return reports

    async def get_report_by_id(self, report_id: str) -> dict:
        """Get report by ID"""
        db = get_database()
        report = await db.reports.find_one({"_id": ObjectId(report_id)})
        if report:
            report["id"] = str(report.pop("_id"))
            report["created_at"] = str(report.get("created_at", ""))
            return report
        return None