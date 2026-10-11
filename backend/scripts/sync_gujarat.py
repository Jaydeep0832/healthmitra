import asyncio

from app.db.mongodb import close_mongo_connection, connect_to_mongo
from app.services.openstreetmap_service import openstreetmap_service


async def main() -> None:
    await connect_to_mongo()
    try:
        count = await openstreetmap_service.sync_region("Gujarat")
        print(f"Imported or updated {count} Gujarat clinics and pharmacies")
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
