from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import uvicorn
import logging
from jose import JWTError, jwt

from app.api.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.audit import router as audit_router
from app.api.v1.chatbot import router as chatbot_router
from app.api.v1.hospitals import router as hospital_router
from app.api.v1.patients import router as patient_router
from app.api.v1.triage import router as triage_router
from app.api.v1.reports import router as report_router
from app.api.v1.schemes import router as schemes_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.config import settings
from app.services.audit_service import log_access

logging.basicConfig(level=logging.INFO)

# Conditionally disable Swagger docs in production
_docs_url = "/docs" if settings.show_docs else None
_redoc_url = "/redoc" if settings.show_docs else None
_openapi_url = "/openapi.json" if settings.show_docs else None

app = FastAPI(
    title="HealthMitra 2.0 API",
    description="HealthMitra API backend",
    version="2.0.0",
    docs_url=_docs_url,
    redoc_url=_redoc_url,
    openapi_url=_openapi_url,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    # Log access for every API request
    response = await call_next(request)

    # Exclude health check from audit logging
    if "/api/health" not in request.url.path:
        user_id = None
        authorization = request.headers.get("Authorization", "")
        if authorization.lower().startswith("bearer "):
            try:
                payload = jwt.decode(
                    authorization[7:],
                    settings.SECRET_KEY,
                    algorithms=[settings.ALGORITHM],
                )
                email = payload.get("sub")
                db = get_database()
                if email and db is not None:
                    user = await db["users"].find_one(
                        {"email": email}, {"_id": 1}
                    )
                    if user:
                        user_id = str(user["_id"])
            except (JWTError, ValueError, TypeError):
                user_id = None

        try:
            await asyncio.wait_for(
                log_access(
                    action=request.method,
                    resource_type=request.url.path,
                    user_id=user_id,
                    ip_address=request.client.host if request.client else None
                ),
                timeout=1.0,
            )
        except asyncio.TimeoutError:
            logging.warning("Audit logging timed out; request completed without an audit entry")
        except Exception:
            logging.warning("Audit logging unavailable; request completed without an audit entry")
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
app.include_router(triage_router, prefix="/api/v1/triage", tags=["Triage"])
app.include_router(report_router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(schemes_router, prefix="/api/v1/schemes", tags=["Health Schemes & Benefits"])

@app.get("/")
async def root():
    return {"message": "Welcome to HealthMitra 2.0 API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
