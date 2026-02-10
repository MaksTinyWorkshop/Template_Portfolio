import { ValidationError } from "@/lib/http/errors";
import { contactSchema, ContactPayload } from "./contact.dto";
import { sendContactNotification } from "../infrastructure/mailer";

export const handleContactRequest = async (payload: unknown) => {
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ValidationError("Données de contact invalides", parsed.error.issues);
  }

  await sendContactNotification(parsed.data);

  return parsed.data;
};
