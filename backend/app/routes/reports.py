from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from app.services.report_service import ReportService
from app.utils.jwt_handler import get_current_user
from typing import Optional

router = APIRouter(prefix="/reports", tags=["Reports"])
report_service = ReportService()


@router.post("/upload", response_model=dict)
async def upload_report(
    file: UploadFile = File(...),
    document_type: str = Form(default="auto"),
    current_user: dict = Depends(get_current_user)
):
    """Upload and analyze a medical report (PDF or Image)"""
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "image/jpeg", "image/jpg",
            "image/png",
            "image/webp"
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file.content_type} not supported. Use PDF, JPG, or PNG."
            )

        # Check file size (max 10MB)
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )

        result = await report_service.process_report(
            user_id=current_user["user_id"],
            file_name=file.filename,
            file_content=contents,
            file_type=file.content_type,
            document_type=document_type
        )

        return {
            "message": "Report processed successfully",
            "report": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report processing failed: {str(e)}"
        )


@router.get("/", response_model=dict)
async def get_user_reports(
    current_user: dict = Depends(get_current_user)
):
    """Get all reports for current user"""
    try:
        reports = await report_service.get_user_reports(current_user["user_id"])
        return {"reports": reports, "total": len(reports)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{report_id}", response_model=dict)
async def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific report details"""
    try:
        report = await report_service.get_report_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        return {"report": report}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )