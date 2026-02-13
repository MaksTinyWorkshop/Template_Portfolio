import { NextResponse } from "next/server";
import { mapErrorToStatus } from "./errors";

export const respondSuccess = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });

export const respondError = (error: unknown) => {
  const { status, message, details } = mapErrorToStatus(error);
  const exposeDetails = process.env.EXPOSE_API_ERROR_DETAILS === "1";
  const payload: Record<string, unknown> = { success: false, error: message };
  if (exposeDetails && details !== undefined) payload.details = details;

  return NextResponse.json(payload, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
};
