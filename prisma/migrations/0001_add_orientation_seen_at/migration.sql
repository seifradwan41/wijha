-- Add orientationSeenAt to User model for admin assistant orientation screen
ALTER TABLE "User" ADD COLUMN "orientationSeenAt" TIMESTAMP(3);
