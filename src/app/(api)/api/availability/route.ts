"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAuthAPI } from "@/lib/utils/auth";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { updateAvailabilitySchema } from "@/lib/schemas/availability.schema";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/errors";

/**
 * GET /api/availability
 * Récupère le statut de disponibilité actuel du site owner
 */
const handleGetAvailability = async (_request: NextRequest) => {
  // Trouver le site owner
  const siteOwner = await prisma.person.findFirst({
    where: { siteOwner: true },
    select: { id: true },
  });

  if (!siteOwner) {
    throw new ApiError("Aucun propriétaire de site trouvé", 404);
  }

  // Récupérer le dernier log de disponibilité
  const latestLog = await prisma.availabilityLog.findFirst({
    where: { personId: siteOwner.id },
    orderBy: { createdAt: "desc" },
    select: {
      status: true,
      createdAt: true,
    },
  });

  if (!latestLog) {
    // Valeur par défaut si aucun log n'existe
    return NextResponse.json({
      status: "unavailable",
      lastUpdated: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    status: latestLog.status,
    lastUpdated: latestLog.createdAt.toISOString(),
  });
};

/**
 * POST /api/availability
 * Met à jour le statut de disponibilité du site owner (nécessite authentification)
 */
const handlePostAvailability = async (request: NextRequest) => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non autorisé - Authentification requise", 401);
  }

  const body = await request.json();
  const validatedData = updateAvailabilitySchema.parse(body);

  const siteOwner = await prisma.person.findFirst({
    where: { siteOwner: true },
    select: { id: true },
  });

  if (!siteOwner) {
    throw new ApiError("Aucun propriétaire de site trouvé", 404);
  }

  const newLog = await prisma.availabilityLog.create({
    data: {
      personId: siteOwner.id,
      status: validatedData.status,
    },
    select: {
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    status: newLog.status,
    lastUpdated: newLog.createdAt.toISOString(),
  });
};

export const GET = withApiErrorHandling(handleGetAvailability);
export const POST = withApiErrorHandling(handlePostAvailability);
