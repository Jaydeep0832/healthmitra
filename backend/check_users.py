import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def get_users():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client[os.getenv("DATABASE_NAME")]
    
    users = await db.users.find({}).to_list(length=100)
    print("="*50)
    print(f"Total Registered Users: {len(users)}")
    print("="*50)
    
    for i, user in enumerate(users, 1):
        name = user.get('full_name', 'Unknown')
        email = user.get('email', 'N/A')
        phone = user.get('phone', 'N/A')
        role = user.get('role', 'patient')
        print(f"{i}. {name} | Email: {email} | Phone: {phone} | Role: {role}")
    
    print("="*50)

if __name__ == "__main__":
    asyncio.run(get_users())
