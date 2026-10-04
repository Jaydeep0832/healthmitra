# HealthMitra 2.0 — Healthcare Compliance

## HIPAA Compliance Measures

### 1. Encryption
- **At Rest**: AES-256 Fernet encryption for sensitive patient data (`app/security/encryption.py`)
- **In Transit**: HTTPS enforced in production; TLS for MongoDB Atlas connections
- **Key Management**: Encryption keys stored in `.env`, never committed to source control

### 2. Authentication & Authorization
- **Passwords**: bcrypt hashing with cost factor 12
- **Tokens**: JWT with configurable expiration (default: 30 minutes)
- **RBAC**: Role-based access control — `patient`, `doctor`, `admin`, `asha_worker`
- **Session Timeout**: Configurable idle timeout

### 3. Audit Logging
- **Scope**: All API requests logged (method, path, IP, timestamp)
- **Storage**: MongoDB `audit_logs` collection — append-only design
- **Retention**: Configurable (default: 7 years for HIPAA)
- **Access**: Admin-only endpoint: `GET /api/v1/admin/audit-logs`

### 4. Data Minimization
- Only essential health data collected
- No unnecessary PII stored
- Users can request data deletion (right to erasure)

### 5. Patient Rights
- **Access**: Users can view/download their health records
- **Rectification**: Profile editing enabled
- **Erasure**: Data deletion supported
- **Portability**: JSON export of all patient data

### 6. Medical Disclaimer
- Every AI response includes: "This is AI-generated health guidance, not medical advice. Please consult a qualified healthcare professional."
- Confidence scores displayed to users
- Emergency symptom detection with hospital referral

## Security Checklist

- [x] Encryption keys not in source code
- [x] Password hashing verified (bcrypt)
- [x] JWT tokens with expiration
- [x] CORS configured
- [x] Input validation (Pydantic models)
- [x] Audit logging operational
- [x] Role-based access control
- [x] Medical disclaimer in all AI responses
- [x] Emergency symptom escalation
- [ ] HTTPS enforcement (production only)
- [ ] Rate limiting (Phase 2)
- [ ] Multi-factor authentication (Phase 2)
