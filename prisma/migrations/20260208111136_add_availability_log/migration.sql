/*
  Warnings:

  - Made the column `siteOwner` on table `Person` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'soon', 'unavailable');

-- AlterTable
ALTER TABLE "Person" ALTER COLUMN "siteOwner" SET NOT NULL;

-- CreateTable
CREATE TABLE "AvailabilityLog" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvailabilityLog_personId_idx" ON "AvailabilityLog"("personId");

-- CreateIndex
CREATE INDEX "AvailabilityLog_createdAt_idx" ON "AvailabilityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AvailabilityLog" ADD CONSTRAINT "AvailabilityLog_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
