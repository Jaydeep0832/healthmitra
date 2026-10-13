# HealthMitra 2.0

> **AI-Powered Healthcare for Rural India** 🏥

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](backend/)
[![React](https://img.shields.io/badge/frontend-React%2018-61DAFB)](frontend/)

---

## 🎯 Overview

> Security hardening is in progress. Newly written sensitive fields are protected before persistence, but legacy data migration and operational controls remain incomplete. This project must not be treated as HIPAA/DISHA compliant or production-ready for real patient data.

HealthMitra is an early-stage healthcare web app for rural India. Security and clinical workflows are still under development; do not use it for real patient data or as medical advice.

- **🤖 Multilingual AI Chatbot** — Chat in Hindi, Gujarati, English, Marathi, Bengali
- **🏥 Healthcare Locator** — Find Gujarat hospitals, clinics, and medical stores on an interactive map
- **📊 Health Dashboard** — Track consultations, medical records, and health scores
- **🔐 Security Controls** — JWT authentication, role checks, and request audit logging (production compliance work remains)

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, TailwindCSS, Zustand, Leaflet |
| **Backend** | FastAPI, Pydantic, Motor (async MongoDB driver) |
| **Database** | MongoDB (documents, geospatial queries) |
| **AI/LLM** | Groq API (Mixture of Experts) |
| **Infrastructure** | Docker, Nginx, GitHub Actions |
| **Security** | bcrypt, JWT, role checks, protected sensitive-field writes, rate limiting, and audit logging; compliance remains incomplete |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone & Setup

```bash
git clone https://github.com/Jaydeep0832/healthmitra.git
cd healthmitra
git checkout feature/v2-production
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values:
# MONGODB_URI=mongodb://mongo:27017
# GROQ_API_KEY=your_groq_api_key
# Generate SECRET_KEY using python -c "import secrets; print(secrets.token_urlsafe(48))".
# Generate ENCRYPTION_KEY using the Fernet.generate_key() command in backend/.env.example.
```

### 3. Run with Docker

```bash
docker compose up -d --build
```

### 4. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| MongoDB | localhost:27017 |

### 5. Sync Gujarat Facilities

Hospital seed data loads during backend startup. To import or refresh mapped clinics and pharmacies across Gujarat, run:

```bash
docker compose exec backend python -m scripts.sync_gujarat
```

The imported records are stored in the `healthmitra.hospitals` collection with `facility_type` set to `clinic` or `pharmacy`.

## 📁 Project Structure

```
healthmitra/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST endpoints
│   │   ├── models/          # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── security/        # Auth, encryption, RBAC
│   │   ├── db/              # MongoDB connection + seed data
│   │   └── main.py          # FastAPI entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client layer
│   │   ├── store/           # Zustand state management
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── CHANGELOG_V2.md
```

## 🔌 API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| POST | `/api/v1/auth/logout` | Revoke the current JWT |
| GET | `/api/v1/auth/me` | Get current user |

### Chatbot
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/chatbot/message` | Send message to AI |
| GET | `/api/v1/chatbot/history` | Get chat history |

### Hospitals & Facilities
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/hospitals/nearby` | Geospatial nearby search |
| GET | `/api/v1/hospitals/search` | Search by service |
| GET | `/api/v1/hospitals/facility-types` | List facility categories |
| GET | `/api/v1/hospitals/{id}` | Hospital details |
| POST | `/api/v1/hospitals/seed` | Seed hospital data |
| POST | `/api/v1/hospitals/sync-gujarat` | Sync Gujarat clinics and pharmacies (admin) |

### Patients
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/patients/me` | Get patient profile |
| PUT | `/api/v1/patients/me` | Update profile |
| GET | `/api/v1/patients/me/dashboard` | Dashboard stats |
| GET | `/api/v1/patients/me/medical-history` | Medical records |

### Private AI Analysis
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/triage/check` | Authenticated symptom triage |
| POST | `/api/v1/reports/analyze-text` | Authenticated report analysis |
| POST | `/api/v1/reports/upload` | Authenticated report upload and analysis |

## 🔐 Security (in progress)

- **Passwords**: bcrypt hashing (cost factor 12)
- **Tokens**: JWT with 15-minute default expiration and server-side revocation on logout
- **Encryption**: Profile, medical-record, and chat sensitive fields are protected before persistence; use `scripts/rotate_encryption_key.py` for controlled key migration
- **RBAC**: Role checks are present; public signup creates patient accounts only
- **Audit**: Request path, IP, timestamp, and resolved authenticated user ID are logged when available
- **CORS**: Configurable origin whitelist
- **External facilities**: OpenStreetMap synchronization runs in the background and cached hospital results are returned without waiting for Overpass

## 🗓️ Development Sprint

| Day | Deliverable | Status |
|-----|------------|--------|
| 1 | Setup & Foundation | ✅ |
| 2 | Authentication + Security | ✅ |
| 3 | Multilingual Chatbot | ✅ |
| 4 | Hospital Locator | ✅ |
| 5 | Patient Dashboard | ✅ |
| 6 | UI Polish + Deployment | ✅ |
| 7 | Testing + Documentation | ✅ |

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request
