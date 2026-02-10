import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { checkAuthAPI } from "@/utils/auth";
import type { Availability, AvailabilityStatus } from "@/types";

const AVAILABILITY_FILE = path.join(process.cwd(), "data", "availability.json");

/**
 * GET /api/availability
 * Récupère le statut de disponibilité actuel
 */
export async function GET() {
  try {
    const fileContent = await fs.readFile(AVAILABILITY_FILE, "utf-8");
    const availability: Availability = JSON.parse(fileContent);

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Erreur lors de la lecture de la disponibilité:", error);

    // Retourne une disponibilité par défaut en cas d'erreur
    const defaultAvailability: Availability = {
      status: "available",
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(defaultAvailability);
  }
}

/**
 * POST /api/availability
 * Met à jour le statut de disponibilité
 * Nécessite authentification admin via cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification via cookie
    const isAuthenticated = await checkAuthAPI();

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Non autorisé - Authentification requise" },
        { status: 401 },
      );
    }

    // Lire et valider le body
    const body = await request.json();
    const { status } = body as { status: string };

    const validStatuses: AvailabilityStatus[] = ["available", "soon", "unavailable"];

    if (!status || !validStatuses.includes(status as AvailabilityStatus)) {
      return NextResponse.json(
        { error: "Statut invalide. Valeurs autorisées: available, soon, unavailable" },
        { status: 400 },
      );
    }

    // Créer le nouvel objet de disponibilité
    const newAvailability: Availability = {
      status: status as AvailabilityStatus,
      lastUpdated: new Date().toISOString(),
    };

    // Écrire dans le fichier
    await fs.writeFile(AVAILABILITY_FILE, JSON.stringify(newAvailability, null, 2), "utf-8");

    return NextResponse.json(newAvailability);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);

    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour" }, { status: 500 });
  }
}
