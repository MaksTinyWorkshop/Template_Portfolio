import type { Prisma } from "@prisma/client";

/**
 * Structure stored inside the `profileData` JSON column.
 * - `contacts`: dedicated shortcuts for emails, WhatsApp, calendar, etc.
 * - `metadata`: optional enriched attributes filled by the admin (languages, location, availability…).
 */
export type JsonObject = Prisma.JsonObject;

export interface PersonProfileData {
  contacts?: JsonObject;
  metadata?: {
    /** Locale or IANA timezone used by the UI. */
    location?: string;
    /** Languages spoken/targeted for the profile. */
    languages?: string[];
    /** Arbitrary availability metadata (status, lastUpdated, etc.). */
    availability?: JsonObject;
  };
  [key: string]: unknown;
}

export interface PersonPayload {
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  pseudo?: string | null;
  role?: string | null;
  bio?: string | null;
  email?: string | null;
  profileData?: PersonProfileData | null;
  avatar?: string | null;
  siteOwner?: boolean | null;
}

export interface PersonProfile {
  id: string;
  fullName: string;
  role: string | null;
  pseudo: string | null;
  bio: string | null;
  avatar: string | null;
  email: string | null;
  profileData: PersonProfileData | null;
  siteOwner: boolean;
}
