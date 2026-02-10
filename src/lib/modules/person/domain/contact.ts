export const CONTACT_NAME_MIN_LENGTH = 2;
export const CONTACT_SUBJECT_MIN_LENGTH = 3;
export const CONTACT_MESSAGE_MIN_LENGTH = 10;

export type ContactPayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};
