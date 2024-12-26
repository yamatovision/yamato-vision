-- Update default gems value for User model
ALTER TABLE "UserCourse" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT false;

