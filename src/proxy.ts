import { TOKEN_MAX_AGE_MS } from "@/lib/utils/auth-constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Comparaison de strings à temps constant pour éviter les timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Vérifie un token HMAC avec Web Crypto API (compatible Edge Runtime)
 */
async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;

    if (!secret) {
      throw new Error(
        "SÉCURITÉ CRITIQUE: AUTH_SECRET et ADMIN_PASSWORD ne sont pas définis ! Le système ne peut pas fonctionner sans secret cryptographique.",
      );
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
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData,
    );
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Comparaison à temps constant pour éviter timing attacks
    if (!timingSafeEqual(receivedSignature, expectedSignature)) return false;

    // Vérifier l'expiration
    const tokenTimestamp = Number.parseInt(timestamp, 10);
    const now = Date.now();

    if (
      Number.isNaN(tokenTimestamp) ||
      now - tokenTimestamp > TOKEN_MAX_AGE_MS
    ) {
      return false;
    }

    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "❌ Erreur lors de la vérification du token dans le middleware:",
        error,
      );
    }
    return false;
  }
} /**
 * Proxy Next.js pour protéger les routes admin
 * S'exécute AVANT le rendu des pages
 * proxy() est la nouvelle convention de nommage pour middleware dans Next.js 13+
 */
export async function proxy(request: NextRequest) {
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
