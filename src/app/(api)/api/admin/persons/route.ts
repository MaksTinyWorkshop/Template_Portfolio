import { NextResponse } from "next/server";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import { listPersons } from "@/lib/modules/person/infrastructure/person.repo";

export async function GET() {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Non authentifié" },
      { status: 401 },
    );
  }

  try {
    const persons = await listPersons();
    const data = persons
      .filter((person) => !person.siteOwner)
      .map((person) => ({
        id: person.id,
        fullName: person.fullName,
        firstName: person.firstName,
        lastName: person.lastName,
        pseudo: person.pseudo,
        role: person.role,
        avatar: person.avatarMedia?.url ?? person.avatarPath ?? null,
        email: person.email,
        profileData: person.profileData,
      }));
    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (error) {
    console.error("Erreur GET /api/admin/persons:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Impossible de charger les personnes" },
      { status: 500 },
    );
  }
}
