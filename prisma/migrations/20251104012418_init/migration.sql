-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plate_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key_number" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "keys_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "key_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "checkout_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkin_time" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'CHECKED_OUT',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "key_transactions_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "keys" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "key_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_license_number_key" ON "users"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_unit_number_key" ON "vehicles"("unit_number");

-- CreateIndex
CREATE UNIQUE INDEX "keys_key_number_key" ON "keys"("key_number");

-- CreateIndex
CREATE INDEX "key_transactions_key_id_idx" ON "key_transactions"("key_id");

-- CreateIndex
CREATE INDEX "key_transactions_user_id_idx" ON "key_transactions"("user_id");

-- CreateIndex
CREATE INDEX "key_transactions_status_idx" ON "key_transactions"("status");
