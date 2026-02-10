/*
  Warnings:

  - You are about to drop the column `mainMediaId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `primary` on the `ArticleTag` table. All the data in the column will be lost.
  - You are about to drop the column `avatarPath` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `contacts` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `isTeam` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `networks` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `roleLabel` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `heroMediaId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `primary` on the `ProjectTag` table. All the data in the column will be lost.
  - You are about to drop the `MediaUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_mainMediaId_fkey";

-- DropForeignKey
ALTER TABLE "MediaUsage" DROP CONSTRAINT "MediaUsage_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_heroMediaId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "mainMediaId",
ADD COLUMN     "mediaId" TEXT;

-- AlterTable
ALTER TABLE "ArticleTag" DROP COLUMN "primary";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "avatarPath",
DROP COLUMN "contactEmail",
DROP COLUMN "contacts",
DROP COLUMN "fullName",
DROP COLUMN "isTeam",
DROP COLUMN "location",
DROP COLUMN "networks",
DROP COLUMN "phone",
DROP COLUMN "roleLabel",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "pseudo" TEXT,
ADD COLUMN     "social" JSONB;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "heroMediaId",
DROP COLUMN "meta",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "ProjectTag" DROP COLUMN "primary";

-- DropTable
DROP TABLE "MediaUsage";

-- DropEnum
DROP TYPE "EntityType";

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "purpose" "MediaPurpose" NOT NULL DEFAULT 'gallery',
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
