import { NotFoundError, ValidationError } from "@/lib/http/errors";

export class PersonNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Aucune personne trouvée pour l'identifiant « ${id} »`);
  }
}

export class PersonDeletionForbiddenError extends ValidationError {
  constructor() {
    super("Le profil propriétaire du site ne peut pas être supprimé");
  }
}
