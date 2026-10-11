import argparse
import asyncio
import os
from copy import deepcopy

from cryptography.fernet import Fernet
from cryptography.fernet import InvalidToken
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.security.encryption import ENCRYPTED_PREFIX


def rotate_value(value: object, old_fernet: Fernet, new_fernet: Fernet) -> tuple[object, bool]:
    if not isinstance(value, str) or not value.startswith(ENCRYPTED_PREFIX):
        return value, False
    plaintext = old_fernet.decrypt(
        value[len(ENCRYPTED_PREFIX) :].encode("utf-8")
    )
    rotated = ENCRYPTED_PREFIX + new_fernet.encrypt(plaintext).decode("utf-8")
    return rotated, True


def rotate_patient_document(
    patient: dict, old_fernet: Fernet, new_fernet: Fernet
) -> tuple[dict, int]:
    updated = deepcopy(patient)
    rotated_count = 0

    for field in ("name", "phone"):
        updated[field], changed = rotate_value(
            updated.get(field), old_fernet, new_fernet
        )
        rotated_count += int(changed)

    for record in updated.get("medical_history", []) or []:
        symptoms = []
        for symptom in record.get("symptoms", []) or []:
            rotated, changed = rotate_value(symptom, old_fernet, new_fernet)
            symptoms.append(rotated)
            rotated_count += int(changed)
        record["symptoms"] = symptoms
        for field in ("ai_diagnosis", "recommended_action"):
            record[field], changed = rotate_value(
                record.get(field), old_fernet, new_fernet
            )
            rotated_count += int(changed)

    for message in updated.get("chat_history", []) or []:
        for field in ("user_message", "ai_response", "ai_diagnosis"):
            message[field], changed = rotate_value(
                message.get(field), old_fernet, new_fernet
            )
            rotated_count += int(changed)

    return updated, rotated_count


async def run(apply_changes: bool) -> None:
    old_key = os.environ.get("ENCRYPTION_KEY_OLD", "")
    new_key = os.environ.get("ENCRYPTION_KEY_NEW", "")
    if not old_key or not new_key:
        raise SystemExit(
            "Set ENCRYPTION_KEY_OLD and ENCRYPTION_KEY_NEW without printing them."
        )
    if old_key == new_key:
        raise SystemExit("The old and new encryption keys must differ.")

    old_fernet = Fernet(old_key.encode("ascii"))
    new_fernet = Fernet(new_key.encode("ascii"))
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    collection = client[settings.MONGODB_DB_NAME]["patients"]
    scanned = 0
    rotated = 0

    documents = await collection.find({}).to_list(length=None)
    prepared = []
    try:
        for patient in documents:
            scanned += 1
            updated, count = rotate_patient_document(patient, old_fernet, new_fernet)
            rotated += count
            prepared.append((patient, updated, count))
    except InvalidToken as exc:
        raise SystemExit(
            "Fernet preflight failed: at least one encrypted value cannot be decrypted; no documents were changed."
        ) from exc

    if apply_changes:
        for patient, updated, count in prepared:
            if count:
                await collection.replace_one(
                    {"_id": patient["_id"]}, updated, upsert=False
                )
    finally:
        client.close()

    mode = "applied" if apply_changes else "dry-run"
    print(f"{mode}: scanned {scanned} patient documents and rotated {rotated} encrypted values")


def main() -> None:
    parser = argparse.ArgumentParser(description="Safely rotate encrypted patient data.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write rotated documents; without this flag only validate and count.",
    )
    args = parser.parse_args()
    asyncio.run(run(args.apply))


if __name__ == "__main__":
    main()
