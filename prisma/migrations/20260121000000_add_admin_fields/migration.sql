-- AlterTable
ALTER TABLE "users" ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "is_disabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "disabled_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "disabled_by" INTEGER;
