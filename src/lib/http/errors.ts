export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Ressource introuvable") {
    super(message, 404);
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = "Données invalides",
    public readonly issues?: unknown,
  ) {
    super(message, 422);
  }
}

export type ErrorResponseMeta = {
  status: number;
  message: string;
  details?: unknown;
};

export const mapErrorToStatus = (error: unknown): ErrorResponseMeta => {
  if (error instanceof ValidationError) {
    return {
      status: error.statusCode,
      message: error.message,
      details: error.issues,
    };
  }

  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }

  const asApiErrorLike =
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof (error as { statusCode: unknown }).statusCode === "number" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as ApiError)
      : null;

  if (asApiErrorLike) {
    return {
      status: asApiErrorLike.statusCode,
      message: asApiErrorLike.message,
    };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: "Erreur serveur" };
};
