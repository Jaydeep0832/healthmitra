<div align="center">

# 🏥 HealthMitra
**AI-Powered Rural Health Assistant for India**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=flat-square)](http://13.232.60.226/)

</div>

---

## Problem & Solution

Rural India faces a critical healthcare gap — 1 doctor per 1,000+ citizens, OPD queues overwhelmed by non-urgent cases, and digital health tools that are English-only, leaving Gujarati and Hindi speakers behind.

**HealthMitra** solves this with a voice-first, multilingual AI assistant that triages symptoms, locates nearby hospitals via GPS, and triggers emergency alerts — all accessible without literacy or English fluency.

> Triage levels: **Self-care → Visit Clinic → Emergency**

---

## Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Triage Engine** | Rule-based + Gemini 1.5 Flash classifies symptom urgency into 3 levels |
| 🗣️ **Multilingual Voice Input** | Web Speech API captures Gujarati & Hindi speech — no server round-trip |
| 📁 **Multimodal Input** | Voice, text, X-ray image, and PDF prescription/lab report support |
| 📍 **GPS Hospital Locator** | Haversine formula ranks nearest hospitals by specialty from device GPS |
| 🚨 **Emergency SOS** | One-tap alert → AWS Lambda + SNS → SMS to emergency contacts in <100ms |
| 🔊 **Audio Response** | gTTS converts AI reply to MP3 in user's language, streamed from S3 |
| 📄 **PDF Report Analysis** | PyMuPDF auto-extracts lab reports via S3-triggered Lambda |

---

## System Architecture

```
User Input  →  Voice / Text / Image / PDF / GPS
                        │
              Nginx  (SSL · Rate Limit · Reverse Proxy)
                        │
        ┌───────────────┴───────────────┐
   React Frontend              FastAPI Backend
   (PWA · Leaflet · JWT)       (NLP · Haversine · PyMuPDF)
                                        │
                  ┌─────────────────────┼──────────────────┐
             Gemini 1.5 Flash    Google Translate        gTTS
             (text+image+PDF)    (normalisation)        (audio)
                                        │
                         AWS  ──────────────────────────
                         EC2 · ELB · S3 · Lambda · VPC
                         IAM · CloudWatch · SNS
                                        │
                              MongoDB Atlas
                         (hospitals · users · triage · reports)
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Leaflet.js, Web Speech API, PWA |
| **Backend** | Python FastAPI, Gunicorn, JWT (HS256), Motor (async MongoDB driver) |
| **AI / NLP** | Gemini 1.5 Flash, Custom Gujarati/Hindi NLP, Google Translate, gTTS |
| **PDF / OCR** | PyMuPDF, Tesseract OCR |
| **Cloud** | AWS EC2, ELB, S3, Lambda, VPC, IAM, CloudWatch, SNS |
| **Database** | MongoDB Atlas — 4 collections, 2dsphere geo index |
| **DevOps** | Docker, docker-compose, Nginx Alpine |

---

## Docker & Deployment

3 isolated containers via `docker-compose`. Only Nginx is internet-facing — the backend port is never exposed publicly.

```
Internet
    │
 Nginx :80/:443          ← only public-facing container
    │
    ├── /api/*  →  Backend :5000 (internal)
    └──   /*    →  React static build
```

```yaml
version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    restart: always

  backend:
    build: ./backend
    expose: ["5000"]
    env_file: .env
    restart: always

  frontend:
    build: ./frontend
    expose: ["3000"]
    restart: always

networks:
  default:
    driver: bridge
```

---

## AWS Infrastructure

| Service | Configuration | Role |
|---------|--------------|------|
| **EC2** | t3.micro, Elastic IP | Runs all 3 Docker containers; IAM role for S3 & CloudWatch access |
| **ELB** | ALB, HTTP:80 | Load balances across 2 EC2 instances; health check every 30s |
| **S3** | SSE-AES256, lifecycle rules | Stores PDFs, images, MP3 audio; access via pre-signed URLs (15-min) |
| **Lambda** | Python 3.11, provisioned concurrency | SOS alert (<100ms); PDF processor on S3 PUT trigger |
| **VPC** | 10.0.0.0/16 | Network isolation; backend port blocked from internet |
| **IAM** | Least-privilege roles | No hardcoded credentials; MFA enforced |
| **CloudWatch** | Log groups + alarms | Per-container logs; 5xx rate alarm; custom metrics |

---

## Database

MongoDB Atlas — `healthmitra` database · 4 collections · 10 indexes

| Collection | Docs | Key Fields |
|------------|------|------------|
| `hospitals` | 20 | name, specialty, phone, GPS coords — **2dsphere indexed** |
| `users` | 17 | profile, language preference, health history, emergency contact |
| `triage_records` | 18 | input text, detected entities, triage level, advice, timestamp |
| `reports` | 4 | S3 key, extracted text, medicines[], test results[], uploaded_at |

---

## Screenshots

> 🌐 Live at **[http://13.232.60.226/](http://13.232.60.226/)**

| Main Dashboard | AI Symptom Checker | Triage Result |
|:-:|:-:|:-:|
| ![dashboard](https://via.placeholder.com/260x160?text=Dashboard) | ![symptom](https://via.placeholder.com/260x160?text=Symptom+Checker) | ![triage](https://via.placeholder.com/260x160?text=Triage+Result) |

| Hospital Locator | PDF Report Analyzer | Emergency SOS |
|:-:|:-:|:-:|
| ![hospital](https://via.placeholder.com/260x160?text=Hospital+Locator) | ![pdf](https://via.placeholder.com/260x160?text=Report+Analyzer) | ![sos](https://via.placeholder.com/260x160?text=Emergency+SOS) |

---

## Installation & Setup

**Prerequisites:** Docker, Docker Compose

```bash
# 1. Clone
git clone https://github.com/Jaydeep0832/healthmitra.git
cd healthmitra

# 2. Configure environment
cp .env.example .env
# Set: GEMINI_API_KEY · MONGODB_URI · JWT_SECRET · S3_BUCKET_NAME · SNS_TOPIC_ARN

# 3. Build and run
docker-compose up --build -d

# App runs at http://localhost
```

To redeploy on EC2:

```bash
git pull origin main
docker-compose up --build -d
```

---

<div align="center">

**Jaydeep Parmer** · 23BIT133

*"Bridging the healthcare gap for rural India, one voice at a time."*

</div>
