# HealthMitra 2.0

> **AI-Powered Healthcare for Rural India** 🏥

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](backend/)
[![React](https://img.shields.io/badge/frontend-React%2018-61DAFB)](frontend/)

---

## 🎯 Overview

HealthMitra is a production-grade healthcare platform designed for rural India, featuring:

- **🤖 Multilingual AI Chatbot** — Chat in Hindi, Gujarati, English, Marathi, Bengali
- **🏥 Hospital Locator** — Find 100+ Gujarat hospitals on an interactive map
- **📊 Health Dashboard** — Track consultations, medical records, and health scores
- **🔐 HIPAA-Compliant Security** — AES-256 encryption, JWT auth, audit logging

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, TailwindCSS, Zustand, Leaflet |
| **Backend** | FastAPI, Pydantic, Motor (async MongoDB driver) |
| **Database** | MongoDB (documents, geospatial queries) |
| **AI/LLM** | Groq API (Mixture of Experts) |
| **Infrastructure** | Docker, Nginx, GitHub Actions |
| **Security** | bcrypt, JWT, AES-256 Fernet encryption, RBAC |

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
# SECRET_KEY=your_jwt_secret
# ENCRYPTION_KEY=your_fernet_key
```

### 3. Run with Docker

```bash
docker-compose up -d --build
```

### 4. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| MongoDB | localhost:27017 |

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
| GET | `/api/v1/auth/me` | Get current user |

### Chatbot
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/chatbot/message` | Send message to AI |
| GET | `/api/v1/chatbot/history` | Get chat history |

### Hospitals
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/hospitals/nearby` | Geospatial nearby search |
| GET | `/api/v1/hospitals/search` | Search by service |
| GET | `/api/v1/hospitals/{id}` | Hospital details |
| POST | `/api/v1/hospitals/seed` | Seed hospital data |

### Patients
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/patients/me` | Get patient profile |
| PUT | `/api/v1/patients/me` | Update profile |
| GET | `/api/v1/patients/me/dashboard` | Dashboard stats |
| GET | `/api/v1/patients/me/medical-history` | Medical records |

## 🔐 Security

- **Passwords**: bcrypt hashing (cost factor 12)
- **Tokens**: JWT with 30-min expiration
- **Encryption**: AES-256 Fernet for sensitive data
- **RBAC**: Role-based access (patient/doctor/admin)
- **Audit**: Every API request logged with user, IP, timestamp
- **CORS**: Configurable origin whitelist

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
