from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.health import router as health_router

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

# Include Routers
app.include_router(health_router, prefix="/api", tags=["Health Check"])

@app.get("/")
async def root():
    return {"message": "Welcome to HealthMitra 2.0 API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
