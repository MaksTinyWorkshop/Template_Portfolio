import { NextResponse } from "next/server";
import { getPersonView } from "@/lib/modules/person/services/person-profile.service";
import type { PersonView } from "@/lib/modules/person/domain/person.utils";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { ApiError } from "@/lib/http/errors";

export const GET = withApiErrorHandling(async () => {
  const person: PersonView | null = await getPersonView();

  if (!person) {
    throw new ApiError("Profil indisponible", 404);
  }

  return NextResponse.json({ success: true, data: person });
});
