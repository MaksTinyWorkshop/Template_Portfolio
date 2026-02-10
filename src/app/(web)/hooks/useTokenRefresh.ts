"use client";

import { useEffect } from "react";

/**
 * Hook pour rafraîchir automatiquement le token d'authentification
 * Vérifie toutes les 5 minutes si le token doit être rafraîchi
 * (Token expire après 2h, seuil de refresh à 30min restantes)
 */
export function useTokenRefresh() {
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const response = await fetch("/api/refresh-token", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.refreshed) {
            console.log("✅ Token rafraîchi automatiquement");
          }
        } else if (response.status === 401) {
          // Token expiré - ne pas recharger la page (évite boucle infinie)
          // Le RouteGuard détectera l'absence d'auth et affichera le login
          console.warn("⚠️  Token expiré");
        }
      } catch (error) {
        console.error("❌ Erreur lors du rafraîchissement du token:", error);
      }
    };

    // Rafraîchir toutes les 5 minutes (garantit détection fenêtre 30min avant expiration)
    const interval = setInterval(refreshToken, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
