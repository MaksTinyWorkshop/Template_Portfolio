import { NextResponse } from "next/server";
import { getPersonView } from "@/lib/modules/person/services/person-profile.service";
import type { PersonView } from "@/lib/modules/person/domain/person.utils";

export async function GET() {
  const person: PersonView | null = await getPersonView();

  if (!person) {
    return NextResponse.json({ success: false, error: "Profil indisponible" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: person });
}
