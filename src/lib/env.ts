import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SHADOW_DATABASE_URL: z.string().min(1).optional(),
  CONTACT_EMAIL_RECIPIENT: z.string().email().optional(),
  CONTACT_EMAIL_SENDER: z.string().email().optional(),
  CONTACT_WEBHOOK_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
