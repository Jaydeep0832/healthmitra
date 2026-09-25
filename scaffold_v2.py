import os
import shutil

def create_file(path, content=""):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    base_dir = "backend"
    
    # Create backend structure
    dirs = [
        "app/security",
        "app/api/v1",
        "app/models",
        "app/services",
        "app/db",
        "app/logging",
        "tests"
    ]
    
    for d in dirs:
        os.makedirs(os.path.join(base_dir, d), exist_ok=True)
        
    # Create files
    files = [
        ("app/main.py", ""),
        ("app/config.py", ""),
        ("app/security/auth.py", ""),
        ("app/security/encryption.py", ""),
        ("app/security/roles.py", ""),
        ("app/api/v1/chatbot.py", ""),
        ("app/api/v1/hospitals.py", ""),
        ("app/api/v1/patients.py", ""),
        ("app/api/v1/audit.py", ""),
        ("app/api/health.py", ""),
        ("app/models/patient.py", ""),
        ("app/models/hospital.py", ""),
        ("app/models/chat_history.py", ""),
        ("app/models/audit_log.py", ""),
        ("app/services/llm_service.py", ""),
        ("app/services/hospital_service.py", ""),
        ("app/services/patient_service.py", ""),
        ("app/services/audit_service.py", ""),
        ("app/db/mongodb.py", ""),
        ("app/db/seed.py", ""),
        ("app/logging/logger.py", ""),
        ("tests/test_chatbot.py", ""),
        ("tests/test_hospitals.py", ""),
        ("tests/test_auth.py", ""),
        (".env.example", ""),
    ]
    
    for file_path, content in files:
        create_file(os.path.join(base_dir, file_path), content)
        
    print("Backend scaffolding completed.")

if __name__ == "__main__":
    main()
