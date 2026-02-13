BEGIN;

-- Canonical source of truth for local assets URLs.
UPDATE "Media"
SET "url" = regexp_replace("url", '^/images(/|$)', '/api/assets\\1')
WHERE "url" ~ '^/images(/|$)';

UPDATE "Person"
SET "avatarPath" = regexp_replace("avatarPath", '^/images(/|$)', '/api/assets\\1')
WHERE "avatarPath" IS NOT NULL
  AND "avatarPath" ~ '^/images(/|$)';

-- Ensure every avatar path has a media row before dropping avatarPath.
INSERT INTO "Media" ("url", "kind", "storageProvider", "createdAt", "updatedAt")
SELECT p."avatarPath", 'image'::"MediaKind", 'local', NOW(), NOW()
FROM "Person" p
LEFT JOIN "Media" m ON m."url" = p."avatarPath"
WHERE p."avatarPath" IS NOT NULL
  AND p."avatarPath" <> ''
  AND m.id IS NULL;

-- Backfill relation where missing.
UPDATE "Person" p
SET "avatarMediaId" = m.id
FROM "Media" m
WHERE p."avatarPath" IS NOT NULL
  AND p."avatarPath" <> ''
  AND p."avatarMediaId" IS NULL
  AND m."url" = p."avatarPath";

ALTER TABLE "Person" DROP COLUMN "avatarPath";
ALTER TABLE "Media" DROP COLUMN "storagePath";

COMMIT;
