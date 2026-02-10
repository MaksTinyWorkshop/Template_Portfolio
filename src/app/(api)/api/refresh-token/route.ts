import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as cookie from "cookie";
import { verifyAuthToken, generateAuthToken, shouldRefreshToken } from "@/lib/utils/auth";

/**
 * POST - Rafraîchit le token d'authentification
 * Génère un nouveau token si l'ancien est valide mais proche de l'expiration
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookie.parse(cookieHeader);
    const currentToken = cookies.authToken;

    // Vérifier que le token actuel est valide
    if (!currentToken || !(await verifyAuthToken(currentToken))) {
      return NextResponse.json(
        { success: false, message: "Token invalide ou expiré" },
        { status: 401 },
      );
    }

    // Vérifier si le token doit être rafraîchi
    if (!shouldRefreshToken(currentToken)) {
      return NextResponse.json(
        {
          success: true,
          message: "Token encore valide, pas besoin de rafraîchir",
          refreshed: false,
        },
        { status: 200 },
      );
    }

    // Générer un nouveau token
    const newToken = await generateAuthToken();

    const response = NextResponse.json(
      { success: true, message: "Token rafraîchi avec succès", refreshed: true },
      { status: 200 },
    );

    // Mettre à jour le cookie avec le nouveau token
    response.headers.set(
      "Set-Cookie",
      cookie.serialize("authToken", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 2, // 2 heures
        sameSite: "strict",
        path: "/",
      }),
    );

    return response;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
