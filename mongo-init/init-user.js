// MongoDB initialization script — runs once on first container start
// Creates a dedicated application user with readWrite on healthmitra DB only
// The root admin user is created by MONGO_INITDB_ROOT_USERNAME/PASSWORD env vars

db = db.getSiblingDB("admin");

db.createUser({
  user: "healthmitra_app",
  pwd: process.env.MONGO_APP_PASSWORD || "CHANGE_ME_IN_PRODUCTION",
  roles: [
    { role: "readWrite", db: "healthmitra" }
  ]
});

print("✅ Created healthmitra_app user with readWrite on healthmitra database");
