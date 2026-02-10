-- Add content column to Project so we can store the MDX body
ALTER TABLE "Project" ADD COLUMN "content" TEXT;
