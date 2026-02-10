/*
  Warnings:

  - You are about to drop the column `social` on the `Person` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Person" DROP COLUMN "social",
ADD COLUMN     "avatarPath" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "profileData" JSONB;

ALTER TABLE "Person" ADD COLUMN "siteOwner" BOOLEAN DEFAULT FALSE;
