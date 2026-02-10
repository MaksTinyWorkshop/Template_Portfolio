import { z } from "zod";
import { ARTICLE_STATUSES } from "@/lib/modules/articles/domain/article";
import { PROJECT_STATUSES } from "@/lib/modules/projects/domain/project";

const isRelativePath = (value: string) => /^(\.\/|\.\.\/|\/)/.test(value);

const optionalUrl = (errorMessage: string, options?: { allowRelative?: boolean }) =>
  z.string().refine(
    (val) => {
      if (!val || val === "") return true;
      if (options?.allowRelative && isRelativePath(val)) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: errorMessage },
  );

const socialLinkSchema = z.object({
  name: z.string().min(1, "Le nom du réseau est requis"),
  url: optionalUrl("URL invalide pour le réseau"),
});

export const teamMemberSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis"),
    role: z.string().min(1, "Le rôle est requis"),
    avatar: optionalUrl("URL d'avatar invalide", { allowRelative: true }),
    linkedIn: optionalUrl("URL LinkedIn invalide"),
    email: z.string().email("Email invalide").optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    pseudo: z.string().optional(),
    socials: z.array(socialLinkSchema).optional(),
    personId: z.string().optional(),
    isSiteOwner: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.personId && !data.linkedIn && !(data.socials && data.socials.length)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["linkedIn"],
        message: "Au moins LinkedIn ou un réseau custom est requis pour un nouveau membre",
      });
    }
  });

export const projectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100, "Titre trop long"),
  summary: z.string().min(1, "Le résumé est requis").max(300, "Résumé trop long"),
  publishedAt: z.string().min(1, "La date de publication est requise"),
  status: z.enum(PROJECT_STATUSES),
  typeProjectTag: z.array(z.string()).min(1, "Au moins un tag est requis"),
  featuredImage: optionalUrl("URL d'image invalide", { allowRelative: true }),
  images: z.array(z.string()),
  team: z.array(teamMemberSchema),
  link: optionalUrl("URL du projet invalide", { allowRelative: true }),
  repository: optionalUrl("URL du repository invalide", { allowRelative: true }),
  content: z.string().min(1, "Le contenu est requis"),
});

export const postSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100, "Titre trop long"),
  summary: z.string().min(1, "Le résumé est requis").max(300, "Résumé trop long"),
  publishedAt: z.string().min(1, "La date de publication est requise"),
  status: z.enum(ARTICLE_STATUSES),
  image: optionalUrl("URL d'image invalide", { allowRelative: true }),
  tags: z
    .array(z.string().min(1, "Chaque tag doit être renseigné"))
    .min(1, "Au moins un tag est requis"),
  content: z.string().min(1, "Le contenu est requis"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type PostFormData = z.infer<typeof postSchema>;
export type TeamMemberData = z.infer<typeof teamMemberSchema>;
