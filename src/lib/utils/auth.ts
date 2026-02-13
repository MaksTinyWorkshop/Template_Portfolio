import { cookies } from "next/headers";
import { TOKEN_MAX_AGE_MS, TOKEN_REFRESH_THRESHOLD_MS, MIN_SECRET_LENGTH } from "./auth-constants";
import { timingSafeEqual } from "./timing-safe-equal";

/**
 * Génère un token d'authentification sécurisé avec signature HMAC
 * Format: {timestamp}.{random}.{signature}
 * Utilise Web Crypto API (compatible Edge Runtime)
 */
export async function generateAuthToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error(
      "SÉCURITÉ CRITIQUE: AUTH_SECRET et ADMIN_PASSWORD ne sont pas définis ! Le système ne peut pas fonctionner sans secret cryptographique.",
    );
  }

  // Valider que le secret a une longueur minimale sécurisée
  if (secret.length < MIN_SECRET_LENGTH) {
    const errorMsg = `SÉCURITÉ CRITIQUE: Le secret a seulement ${secret.length} caractères. Minimum requis: ${MIN_SECRET_LENGTH * 2} caractères (${MIN_SECRET_LENGTH} bytes hex). Générer avec: openssl rand -hex 32`;

    // En production, THROW (fail-fast). En dev, warn (flexibilité)
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMsg);
    }
    console.warn(`⚠️  ${errorMsg}`);
  }

  const timestamp = Date.now().toString();

  // Générer random avec Web Crypto API
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const random = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const payload = `${timestamp}.${random}`;

  // Signature HMAC-SHA256 avec Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = signatureArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return `${payload}.${signature}`;
}

/**
 * Vérifie qu'un token est valide et non expiré
 * @param token - Token à vérifier
 * @param maxAge - Durée de validité en ms (défaut: 2 heures)
 * Utilise Web Crypto API (compatible Edge Runtime)
 */
export async function verifyAuthToken(
  token: string,
  maxAge: number = TOKEN_MAX_AGE_MS,
): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;

    if (!secret) {
      throw new Error("SÉCURITÉ CRITIQUE: AUTH_SECRET et ADMIN_PASSWORD ne sont pas définis !");
    }

    // Parser le token
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    const [timestamp, random, receivedSignature] = parts;
    const payload = `${timestamp}.${random}`;

    // Vérifier la signature avec Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Comparaison à temps constant pour éviter timing attacks
    if (!timingSafeEqual(receivedSignature, expectedSignature)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️  Token invalide : signature incorrecte");
      }
      return false;
    }

    // Vérifier l'expiration
    const tokenTimestamp = Number.parseInt(timestamp, 10);
    const now = Date.now();

    if (Number.isNaN(tokenTimestamp) || now - tokenTimestamp > maxAge) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️  Token expiré");
      }
      return false;
    }

    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Erreur lors de la vérification du token:", error);
    }
    return false;
  }
}

/**
 * Vérifie si un token doit être rafraîchi (< 30 minutes restantes)
 * @param token - Token à vérifier
 * @returns true si le token doit être rafraîchi
 */
export function shouldRefreshToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [timestamp] = parts;
    const tokenTimestamp = Number.parseInt(timestamp, 10);
    const now = Date.now();

    const timeRemaining = TOKEN_MAX_AGE_MS - (now - tokenTimestamp);

    // Rafraîchir si moins de TOKEN_REFRESH_THRESHOLD_MS restantes
    return timeRemaining < TOKEN_REFRESH_THRESHOLD_MS && timeRemaining > 0;
  } catch {
    return false;
  }
}

/**
 * Vérifie l'authentification pour les API routes
 * À utiliser dans les routes /api/admin/*
 */
export async function checkAuthAPI(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken");

    if (!authToken?.value) {
      return false;
    }

    return await verifyAuthToken(authToken.value);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Erreur lors de la vérification de l'authentification:", error);
    }
    return false;
  }
}
