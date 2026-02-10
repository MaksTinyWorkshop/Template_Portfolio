import { NotFoundError } from "@/lib/http/errors";

export class ProjectNotFoundError extends NotFoundError {
  constructor(slug: string) {
    super(`Aucun projet trouvé pour le slug « ${slug} »`);
  }
}
