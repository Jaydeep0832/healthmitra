import os

def create_file(path, content=""):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

def main():
    base_dir = "frontend"
    
    # Create frontend structure
    dirs = [
        "src/components/Chatbot",
        "src/components/HospitalLocator",
        "src/components/Layout",
        "src/components/Common",
        "src/pages",
        "src/services",
        "src/store",
        "src/types"
    ]
    
    for d in dirs:
        os.makedirs(os.path.join(base_dir, d), exist_ok=True)
        
    # Create files
    files = [
        ("src/components/Chatbot/MultilingualInput.tsx", ""),
        ("src/components/Chatbot/ChatHistory.tsx", ""),
        ("src/components/Chatbot/LanguageSelector.tsx", ""),
        ("src/components/HospitalLocator/Map.tsx", ""),
        ("src/components/HospitalLocator/HospitalList.tsx", ""),
        ("src/components/HospitalLocator/FilterPanel.tsx", ""),
        ("src/components/Layout/Navbar.tsx", ""),
        ("src/components/Layout/Sidebar.tsx", ""),
        ("src/components/Layout/Footer.tsx", ""),
        ("src/pages/Home.tsx", ""),
        ("src/pages/Chatbot.tsx", ""),
        ("src/pages/Hospitals.tsx", ""),
        ("src/pages/Dashboard.tsx", ""),
        ("src/services/api.ts", ""),
        ("src/services/auth.ts", ""),
        ("src/services/location.ts", ""),
        ("src/store/useAuthStore.ts", ""),
        ("src/store/useChatStore.ts", ""),
        ("src/store/useLocationStore.ts", ""),
        ("src/types/models.ts", ""),
        ("src/types/api.ts", ""),
        (".env.example", ""),
    ]
    
    for file_path, content in files:
        create_file(os.path.join(base_dir, file_path), content)
        
    print("Frontend scaffolding completed.")

if __name__ == "__main__":
    main()
