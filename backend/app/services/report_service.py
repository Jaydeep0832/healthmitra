from app.services.database import get_database
from bson import ObjectId
from datetime import datetime
import io
import re
import os
import json

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

try:
    import requests as http_requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


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
                if text.strip():
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
                if text.strip():
                    return text
            except Exception as e:
                print(f"pdfplumber extraction error: {e}")

        return ""

    def extract_text_from_image(self, file_content: bytes) -> str:
        """Extract text from image — returns empty for Gemini Vision to handle"""
        return ""

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

    def _call_gemini_text(self, prompt: str) -> str:
        """Call Gemini API with a text prompt"""
        if not GEMINI_API_KEY or not REQUESTS_AVAILABLE:
            return ""

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048,
                }
            }
            resp = http_requests.post(url, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"Gemini API error: {e}")
        return ""

    def _call_gemini_with_image(self, file_content: bytes, file_type: str) -> str:
        """Call Gemini API with an image for Vision analysis"""
        if not GEMINI_API_KEY or not REQUESTS_AVAILABLE:
            return ""

        import base64
        try:
            b64_data = base64.b64encode(file_content).decode("utf-8")

            mime_map = {
                "image/jpeg": "image/jpeg",
                "image/jpg": "image/jpeg",
                "image/png": "image/png",
                "image/webp": "image/webp",
                "application/pdf": "application/pdf",
            }
            mime = mime_map.get(file_type, "image/jpeg")

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

            prompt_text = (
                "You are a medical report analyzer for rural Indian healthcare (HealthMitra). "
                "Analyze this medical document thoroughly and provide:\n\n"
                "1. **Document Type**: What type of report is this (Lab Report, Prescription, X-Ray, Discharge Summary, etc.)\n"
                "2. **Patient Summary**: Key patient info if visible\n"
                "3. **Key Findings**: All important test results, values, and observations\n"
                "4. **Abnormal Values**: Any values outside normal range (mark as ⚠️ HIGH or ⚠️ LOW)\n"
                "5. **AI Summary**: Easy-to-understand explanation in simple language that a rural patient can understand\n"
                "6. **Health Suggestions**: 3-5 actionable health suggestions based on the findings\n"
                "7. **When to See Doctor**: Advice on urgency of medical consultation\n"
                "8. **Medicines Found**: List any medicines mentioned\n\n"
                "Format the response clearly with sections. Use simple language. "
                "Add emojis for readability. End with a disclaimer."
            )

            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt_text},
                        {"inline_data": {"mime_type": mime, "data": b64_data}}
                    ]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048,
                }
            }
            resp = http_requests.post(url, json=payload, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"Gemini Vision API error: {e}")
        return ""

    def generate_ai_summary(self, text: str, document_type: str, extracted_data: dict) -> dict:
        """Generate AI-powered summary and suggestions using Gemini"""
        prompt = (
            "You are HealthMitra, an AI medical report analyzer for rural Indian healthcare workers and patients. "
            f"Analyze this medical report text and provide a comprehensive analysis.\n\n"
            f"Document Type: {document_type.replace('_', ' ').title()}\n"
            f"Extracted Text:\n{text[:3000]}\n\n"
            f"Already Extracted Data:\n"
            f"- Patient Name: {extracted_data.get('patient_name', 'N/A')}\n"
            f"- Medicines Found: {', '.join(extracted_data.get('medicines', [])) or 'None detected'}\n"
            f"- Test Results: {json.dumps(extracted_data.get('test_results', []))}\n"
            f"- Abnormal Values: {json.dumps(extracted_data.get('abnormal_values', []))}\n\n"
            "Please provide your analysis in this EXACT JSON format (no markdown, just pure JSON):\n"
            "{\n"
            '  "summary": "A comprehensive easy-to-understand summary of the report in 3-5 sentences. Use simple language suitable for rural patients.",\n'
            '  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"],\n'
            '  "risk_level": "low/medium/high",\n'
            '  "risk_explanation": "Brief explanation of why this risk level",\n'
            '  "when_to_see_doctor": "Advice on when to consult doctor",\n'
            '  "diet_advice": "Dietary recommendations based on report findings",\n'
            '  "lifestyle_advice": "Lifestyle recommendations"\n'
            "}\n\n"
            "IMPORTANT: Return ONLY the JSON object, no other text."
        )

        gemini_response = self._call_gemini_text(prompt)

        # Parse Gemini response
        if gemini_response:
            try:
                # Clean markdown fences if present
                cleaned = gemini_response.strip()
                if cleaned.startswith("```"):
                    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
                    cleaned = re.sub(r'\s*```$', '', cleaned)
                ai_data = json.loads(cleaned)
                return ai_data
            except json.JSONDecodeError:
                # If JSON parsing fails, use the raw text as summary
                return {
                    "summary": gemini_response[:1000],
                    "suggestions": ["Consult your doctor for detailed interpretation of this report"],
                    "risk_level": "medium",
                    "risk_explanation": "Unable to fully analyze. Please consult a healthcare professional.",
                    "when_to_see_doctor": "Visit your doctor within the next few days for proper interpretation.",
                    "diet_advice": "Maintain a balanced diet with fruits, vegetables, and adequate water intake.",
                    "lifestyle_advice": "Get regular exercise and adequate sleep."
                }

        # Fallback if Gemini is unavailable
        return self._generate_fallback_summary(text, document_type, extracted_data)

    def _generate_fallback_summary(self, text: str, document_type: str, extracted_data: dict) -> dict:
        """Fallback summary when Gemini is not available"""
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

        if len(summary_parts) <= 1:
            summary_parts.append("Report uploaded successfully. AI analysis requires Gemini API key configuration.")

        suggestions = [
            "Show this report to your doctor for proper interpretation",
            "Keep this report safe for future reference",
            "Take all prescribed medicines on time",
            "Follow up with your doctor as recommended",
            "Maintain a healthy diet and stay hydrated"
        ]

        return {
            "summary": "\n".join(summary_parts),
            "suggestions": suggestions,
            "risk_level": "medium" if extracted_data.get("abnormal_values") else "low",
            "risk_explanation": "Abnormal values detected in report" if extracted_data.get("abnormal_values") else "No critical abnormalities detected by automated scan",
            "when_to_see_doctor": "Visit your doctor within 2-3 days for detailed interpretation",
            "diet_advice": "Eat balanced meals with fruits, vegetables, and adequate protein",
            "lifestyle_advice": "Get regular exercise, adequate sleep, and stay hydrated"
        }

    async def process_report(
        self,
        user_id: str,
        file_name: str,
        file_content: bytes,
        file_type: str,
        document_type: str = "auto"
    ) -> dict:
        """Process uploaded medical report with Gemini AI analysis"""
        db = get_database()

        # Step 1: Extract text from PDF
        extracted_text = ""
        if "pdf" in file_type.lower():
            extracted_text = self.extract_text_from_pdf(file_content)

        # Step 2: Try Gemini Vision for images OR PDFs with no extractable text
        gemini_vision_summary = ""
        if not extracted_text.strip():
            # Use Gemini Vision for images or scanned PDFs
            gemini_vision_summary = self._call_gemini_with_image(file_content, file_type)
            if not gemini_vision_summary:
                extracted_text = "Document uploaded. Text could not be extracted automatically."

        # Step 3: Auto-classify if needed
        if document_type == "auto":
            if extracted_text.strip():
                document_type = self.classify_document(extracted_text)
            else:
                document_type = "general_report"

        # Step 4: Extract structured data from text
        extracted_data = self.extract_medical_data(extracted_text) if extracted_text.strip() else {
            "patient_name": "", "doctor_name": "", "date": "",
            "medicines": [], "test_results": [], "diagnosis": [], "abnormal_values": []
        }

        # Step 5: Generate AI analysis
        if gemini_vision_summary:
            # Use Gemini Vision result directly
            ai_analysis = {
                "summary": gemini_vision_summary,
                "suggestions": [
                    "Show this report to your doctor for detailed interpretation",
                    "Take all prescribed medicines on time",
                    "Follow up with your doctor as recommended",
                    "Maintain a healthy diet and stay hydrated",
                    "Get regular health checkups"
                ],
                "risk_level": "medium",
                "risk_explanation": "AI analysis completed via image recognition",
                "when_to_see_doctor": "Consult your doctor within the next visit for proper interpretation",
                "diet_advice": "Maintain a balanced diet",
                "lifestyle_advice": "Follow a healthy lifestyle with regular exercise"
            }
            # Try to get structured analysis from the vision response
            structured_prompt = (
                f"Based on this medical report analysis, extract in JSON format:\n"
                f"{gemini_vision_summary[:2000]}\n\n"
                "Return ONLY this JSON:\n"
                '{"suggestions": ["5 health suggestions"], "risk_level": "low/medium/high", '
                '"when_to_see_doctor": "advice", "diet_advice": "dietary tips", "lifestyle_advice": "lifestyle tips"}'
            )
            structured = self._call_gemini_text(structured_prompt)
            if structured:
                try:
                    cleaned = structured.strip()
                    if cleaned.startswith("```"):
                        cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
                        cleaned = re.sub(r'\s*```$', '', cleaned)
                    parsed = json.loads(cleaned)
                    ai_analysis.update(parsed)
                    ai_analysis["summary"] = gemini_vision_summary
                except Exception:
                    pass
        elif extracted_text.strip() and extracted_text != "Document uploaded. Text could not be extracted automatically.":
            ai_analysis = self.generate_ai_summary(extracted_text, document_type, extracted_data)
        else:
            ai_analysis = self._generate_fallback_summary("", document_type, extracted_data)

        # Step 6: Build AI summary string
        ai_summary = ai_analysis.get("summary", "Report processed successfully.")
        if ai_analysis.get("suggestions"):
            ai_summary += "\n\n💡 Health Suggestions:\n"
            for i, s in enumerate(ai_analysis["suggestions"][:5], 1):
                ai_summary += f"  {i}. {s}\n"

        if ai_analysis.get("when_to_see_doctor"):
            ai_summary += f"\n👨‍⚕️ Doctor Visit: {ai_analysis['when_to_see_doctor']}"

        if ai_analysis.get("diet_advice"):
            ai_summary += f"\n🥗 Diet: {ai_analysis['diet_advice']}"

        ai_summary += "\n\n⚠️ Note: This is an AI-generated analysis. Please consult your doctor for proper medical interpretation."

        # Step 7: Save to database
        report = {
            "user_id": user_id,
            "file_name": file_name,
            "file_type": file_type,
            "document_type": document_type,
            "extracted_text": extracted_text[:5000],
            "extracted_data": extracted_data,
            "ai_summary": ai_summary,
            "ai_suggestions": ai_analysis.get("suggestions", []),
            "risk_level": ai_analysis.get("risk_level", "low"),
            "risk_explanation": ai_analysis.get("risk_explanation", ""),
            "when_to_see_doctor": ai_analysis.get("when_to_see_doctor", ""),
            "diet_advice": ai_analysis.get("diet_advice", ""),
            "lifestyle_advice": ai_analysis.get("lifestyle_advice", ""),
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
            "ai_suggestions": ai_analysis.get("suggestions", []),
            "risk_level": ai_analysis.get("risk_level", "low"),
            "risk_explanation": ai_analysis.get("risk_explanation", ""),
            "when_to_see_doctor": ai_analysis.get("when_to_see_doctor", ""),
            "diet_advice": ai_analysis.get("diet_advice", ""),
            "lifestyle_advice": ai_analysis.get("lifestyle_advice", ""),
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