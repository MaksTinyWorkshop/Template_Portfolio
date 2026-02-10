import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_MAX_AGE_MS } from "@/utils/auth-constants";

/**
 * Vérifie un token HMAC avec Web Crypto API (compatible Edge Runtime)
 */
async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;

    if (!secret) {
      throw new Error("SÉCURITÉ CRITIQUE: AUTH_SECRET et ADMIN_PASSWORD ne sont pas définis !");
    }

    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [timestamp, random, receivedSignature] = parts;
    const payload = `${timestamp}.${random}`;

    // Encoder le secret et le payload
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    // Importer la clé HMAC
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    // Calculer la signature
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (receivedSignature !== expectedSignature) return false;

    // Vérifier l'expiration
    const tokenTimestamp = Number.parseInt(timestamp, 10);
    const now = Date.now();

    if (Number.isNaN(tokenTimestamp) || now - tokenTimestamp > TOKEN_MAX_AGE_MS) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du token dans le middleware:", error);
    return false;
  }
}

/**
 * Middleware Next.js pour protéger les routes admin
 * S'exécute AVANT le rendu des pages
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protéger toutes les routes /admin/* sauf /admin (page de login gérée par RouteGuard)
  if (pathname.startsWith("/admin/")) {
    const token = request.cookies.get("authToken")?.value;

    // Vérifier le token
    if (!token || !(await verifyTokenEdge(token))) {
      // Rediriger vers la page admin (qui affichera le login via RouteGuard)
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/**
 * Configuration du middleware
 * Matcher: routes à protéger
 */
export const config = {
  matcher: ["/admin/:path*"],
};
