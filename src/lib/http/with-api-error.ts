import type { NextResponse } from "next/server";
import { respondError } from "./response";

type ApiRouteHandler<Args extends unknown[]> = (...args: Args) => Promise<NextResponse>;

export function withApiErrorHandling<Args extends unknown[]>(
  handler: ApiRouteHandler<Args>,
): ApiRouteHandler<Args> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("Erreur API capturée:", error);
      return respondError(error);
    }
  };
}
