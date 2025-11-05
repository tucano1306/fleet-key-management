-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DRIVER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "employee_id", "full_name", "id", "is_active", "license_number", "pin_hash", "updated_at") SELECT "created_at", "employee_id", "full_name", "id", "is_active", "license_number", "pin_hash", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");
CREATE UNIQUE INDEX "users_license_number_key" ON "users"("license_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
