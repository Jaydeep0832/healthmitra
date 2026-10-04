from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from app.api.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.audit import router as audit_router
from app.api.v1.chatbot import router as chatbot_router
from app.api.v1.hospitals import router as hospital_router
from app.api.v1.patients import router as patient_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.services.audit_service import log_access
from fastapi import Request

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="HealthMitra 2.0 API",
    description="Production-grade backend for HealthMitra",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    # Log access for every API request
    response = await call_next(request)
    
    # Exclude health check from audit logging
    if "/api/health" not in request.url.path:
        await log_access(
            action=request.method,
            resource_type=request.url.path,
            ip_address=request.client.host if request.client else None
        )
    return response

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    # Auto-seed hospital data on first startup
    from app.services.hospital_service import hospital_service
    try:
        count = await hospital_service.seed_from_csv()
        logging.info(f"Hospital data ready: {count} hospitals")
    except Exception as e:
        logging.warning(f"Hospital seed skipped: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include Routers
app.include_router(health_router, prefix="/api", tags=["Health Check"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(audit_router, prefix="/api/v1/admin", tags=["Audit"])
app.include_router(chatbot_router, prefix="/api/v1/chatbot", tags=["Chatbot"])
app.include_router(hospital_router, prefix="/api/v1", tags=["Hospitals"])
app.include_router(patient_router, prefix="/api/v1", tags=["Patients"])

@app.get("/")
async def root():
    return {"message": "Welcome to HealthMitra 2.0 API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
