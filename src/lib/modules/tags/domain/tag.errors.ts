import { NotFoundError } from "@/lib/http/errors";

export class TagNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`Aucun tag trouvé pour « ${identifier} »`);
  }
}
