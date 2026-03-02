-- CreateEnum
CREATE TYPE "auth_provider" AS ENUM ('Local', 'Google');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "media_asset_type" AS ENUM ('Profile_Picture', 'Company_Logo');

-- CreateEnum
CREATE TYPE "role_name" AS ENUM ('Admin', 'Member');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" "auth_provider" NOT NULL,
    "status" "user_status" NOT NULL DEFAULT 'Active',
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "role_name" NOT NULL DEFAULT 'Member',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "designation" TEXT,
    "contact_number" TEXT,
    "connect_me_for" TEXT,
    "company_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_type" "media_asset_type" NOT NULL,
    "s3_key" TEXT NOT NULL,
    "cdn_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_in_bytes" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_designation_idx" ON "profiles"("designation");

-- CreateIndex
CREATE INDEX "profiles_company_name_idx" ON "profiles"("company_name");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_refresh_token_idx" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "media_assets_user_id_idx" ON "media_assets"("user_id");

-- CreateIndex
CREATE INDEX "media_assets_asset_type_idx" ON "media_assets"("asset_type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
