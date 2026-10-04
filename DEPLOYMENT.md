# HealthMitra 2.0 — Deployment Guide

## Local Development (Docker)

```bash
# 1. Clone and switch to v2 branch
git clone https://github.com/Jaydeep0832/healthmitra.git
cd healthmitra
git checkout feature/v2-production

# 2. Create .env
cp backend/.env.example backend/.env
# Edit with your values

# 3. Start
docker-compose up -d --build

# 4. Verify
curl http://localhost:8000/api/health
# → {"status":"ok","version":"2.0.0"}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `GROQ_API_KEY` | ✅ | Groq API key for LLM |
| `SECRET_KEY` | ✅ | JWT signing secret |
| `ENCRYPTION_KEY` | ✅ | Fernet encryption key |
| `ALGORITHM` | ❌ | JWT algorithm (default: HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | Token expiry (default: 30) |

## Production Deployment (Railway.app)

### Backend
1. Connect GitHub repo on [Railway](https://railway.app)
2. Set root directory: `backend`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Railway dashboard
5. Deploy on push

### Frontend
1. Build: `cd frontend && npm run build`
2. Deploy `build/` folder to Vercel or Railway static site
3. Set `REACT_APP_API_URL` to backend Railway URL

### MongoDB
- Use [MongoDB Atlas](https://cloud.mongodb.com) free tier (512MB)
- Create cluster → get connection string → set as `MONGODB_URI`

## Monitoring

- **Health Check**: `GET /api/health`
- **API Docs**: `GET /docs` (Swagger UI)
- **Audit Logs**: `GET /api/v1/admin/audit-logs` (admin token required)

## Scaling

- Backend: Add replicas via Railway/Docker Swarm
- MongoDB: Upgrade Atlas tier or add read replicas
- Frontend: CDN (Vercel/Cloudflare) handles scaling automatically
