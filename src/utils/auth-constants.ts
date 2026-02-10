/**
 * Constantes pour le système d'authentification
 * Centralisées pour éviter la duplication de magic numbers
 */

// Durée de validité du token (2 heures en millisecondes)
export const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

// Durée de validité pour les cookies (2 heures en secondes)
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 2;

// Seuil de rafraîchissement (30 minutes avant expiration, en millisecondes)
export const TOKEN_REFRESH_THRESHOLD_MS = 30 * 60 * 1000;

// Intervalle de vérification auto-refresh (5 minutes en millisecondes)
export const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// Longueur minimale recommandée pour le secret (en caractères)
export const MIN_SECRET_LENGTH = 32;
