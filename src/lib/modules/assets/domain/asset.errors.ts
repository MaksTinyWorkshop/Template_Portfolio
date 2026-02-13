import { NotFoundError, ValidationError } from "@/lib/http/errors";

export class AssetPathValidationError extends ValidationError {
  constructor(message = "Chemin d'asset invalide") {
    super(message);
  }
}

export class AssetNotFoundError extends NotFoundError {
  constructor(assetPath: string) {
    super(`Asset introuvable: ${assetPath}`);
  }
}

export class AssetConflictError extends ValidationError {
  constructor(message = "Un asset existe déjà avec ce nom") {
    super(message);
  }
}
