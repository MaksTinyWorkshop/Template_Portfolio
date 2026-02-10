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
  return NextResponse.json({ error: message, details }, { status });
};
