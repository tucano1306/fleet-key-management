/*
  Warnings:

  - You are about to drop the column `license_number` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "license_last4" TEXT,
    "dispatch_id" TEXT,
    "pin_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DRIVER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "dispatch_id", "employee_id", "full_name", "id", "is_active", "pin_hash", "role", "updated_at") SELECT "created_at", "dispatch_id", "employee_id", "full_name", "id", "is_active", "pin_hash", "role", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");
CREATE UNIQUE INDEX "users_license_last4_key" ON "users"("license_last4");
CREATE UNIQUE INDEX "users_dispatch_id_key" ON "users"("dispatch_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
