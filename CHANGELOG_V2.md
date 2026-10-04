# HealthMitra 2.0 — Development Changelog

> **Sprint**: 7-day production MVP  
> **Branch**: `feature/v2-production`  
> **Started**: September 25, 2026  

---

## Day 1 · Setup & Foundation ✅

### Environment Initialization
- **Git Branch:** `feature/v2-production` (from `main`)
- **Baseline Commit:** `2294565` (docs: revamp README)

### Backend Setup
- Framework: FastAPI 0.104.1 + Uvicorn 0.24.0
- Database Driver: PyMongo 4.6.1 + Motor 3.3.2
- Entry Point: `app/main.py` — CORS, health check, startup/shutdown
- Config: `app/config.py` — Pydantic Settings with `.env`
- Health Check: `GET /api/health` returns `{"status": "ok", "version": "2.0.0"}`

### Frontend Setup
- React 19 + TypeScript 4.9, Zustand 4.5, TailwindCSS 3.3
- React Router DOM 7.13, Axios 1.13, Framer Motion 11.0, Lucide React 0.359

### Docker & Infrastructure
- docker-compose.yml: 3 services (backend :8000, frontend :3000->80, mongo :27017)
- Frontend Dockerfile: Multi-stage Node 18 build -> Nginx Alpine
- Backend Dockerfile: Python 3.11-slim with gcc
- Nginx: Reverse proxy /api -> backend:8000 with resilient resolver pattern
- GitHub Actions: .github/workflows/tests.yml for CI

---

## Day 2 · Authentication + Security Layer ✅

### JWT Authentication System
- `app/security/auth.py` — bcrypt password hashing + JWT token creation/validation
- `app/models/user.py` — UserBase, UserCreate, UserInDB, UserResponse, Token, TokenData
- `app/api/v1/auth.py` — POST /register, POST /login, GET /me
- bcrypt pinned to 4.0.1 (passlib 1.7.4 incompatible with bcrypt >=5.0)

### HIPAA Encryption Layer
- `app/security/encryption.py` — AES-256 via Fernet (cryptography library)
- `app/security/roles.py` — require_role() decorator for RBAC

### Audit Logging
- `app/models/audit_log.py` — AuditLogCreate, AuditLogResponse
- `app/services/audit_service.py` — log_access() saves to MongoDB audit_logs collection
- `app/main.py` — Global HTTP middleware logging every request
- `app/api/v1/audit.py` — GET /api/v1/admin/audit-logs (admin-only)

### Frontend Auth UI
- src/services/auth.ts — register(), login(), getMe(), logout()
- src/store/useAuthStore.ts — Zustand store with checkAuth(), localStorage sync
- src/components/Common/AuthGuard.tsx — Route guard with loading spinner
- src/pages/Login.tsx — Sign-in form with error handling
- src/pages/Register.tsx — Registration with role selector

---

## Day 3 · Multilingual Chatbot ✅

### Backend Chatbot Service
- `app/services/llm_service.py` — HealthMitraLLM class with Groq API
  - Model: openai/gpt-oss-20b (migrated from decommissioned llama3-70b-8192)
  - JSON-structured responses with confidence scores and escalation flags
- `app/services/translation_service.py` — langdetect for automatic language detection
- `app/models/chat_history.py` — ChatMessage, ChatSessionCreate, ChatRequest
- `app/api/v1/chatbot.py` — POST /message, GET /history

### Frontend Chatbot UI
- src/store/useChatStore.ts, src/components/Chatbot/* (MultilingualInput, ChatHistory, LanguageSelector)
- src/pages/Chatbot.tsx — Assembled chat page with voice input

### Layout & Navigation
- Navbar.tsx, Footer.tsx, Sidebar.tsx — Production layout
- Home.tsx — Landing with hero + features grid
- Dashboard.tsx — Welcome banner + quick stats
- App.tsx — Master router with AuthGuard-protected routes

---

## Bug Fixes & Architecture Corrections

- **bcrypt 5.0 crash**: Pinned bcrypt==4.0.1
- **Groq model decommissioned**: llama3-70b-8192 -> openai/gpt-oss-20b
- **Frontend Dockerfile**: Added --legacy-peer-deps
- **docker-compose ports**: 3000:3000 -> 3000:80
- **Nginx crash on backend down**: resolver + variable proxy_pass
- **TypeScript isolatedModules**: Created tsconfig.json
- **AuthGuard children prop**: Made optional for React 19
- **models/__init__.py crash**: Fixed import names
- **Legacy .js/.tsx conflicts**: Removed duplicate .js files
- **email-validator**: Added to requirements.txt

---

## Verified End-to-End (API Tests)

- POST /api/v1/auth/register — 201 Created
- POST /api/v1/auth/login — 200 OK (JWT returned)
- GET /api/v1/auth/me — 200 OK (profile returned)
- POST /api/v1/chatbot/message — 200 OK (AI diagnosis returned)

---

## Next: Day 4 — Hospital Locator (Geospatial)

Planned: Gujarat hospital dataset, MongoDB 2dsphere index, Leaflet map, nearby search API
