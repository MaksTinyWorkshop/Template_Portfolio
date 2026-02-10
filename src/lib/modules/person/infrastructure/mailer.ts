import { env } from "@/lib/env";
import type { ContactPayload } from "../application/contact.dto";

const composePlainText = (payload: ContactPayload) =>
  `
  Nouveau message reçu depuis le formulaire de contact :
  Nom : ${payload.name}
  Email : ${payload.email}
  Sujet : ${payload.subject ?? "non renseigné"}
  Message :
  ${payload.message}
  `;

export const sendContactNotification = async (payload: ContactPayload) => {
  const recipient = env.CONTACT_EMAIL_RECIPIENT ?? "contact@portfolio-app.example";
  const sender = env.CONTACT_EMAIL_SENDER ?? "no-reply@portfolio-app.example";

  const body = composePlainText(payload);
  console.info(`[contact] envoi simulé : ${payload.name} -> ${recipient}`);
  console.debug(body);

  if (env.CONTACT_WEBHOOK_URL) {
    await fetch(env.CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient,
        sender,
        ...payload,
      }),
    });
  }
};
