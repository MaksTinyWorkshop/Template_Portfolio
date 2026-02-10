import { NotFoundError } from "@/lib/http/errors";

export class ArticleNotFoundError extends NotFoundError {
  constructor(slug: string) {
    super(`Aucun article trouvé pour le slug « ${slug} »`);
  }
}
