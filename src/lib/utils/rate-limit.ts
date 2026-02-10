import { prisma } from "@/lib/prisma";

/**
 * Configuration du rate limiting
 */
export interface RateLimitConfig {
  /**
   * Nombre maximum de requêtes autorisées dans la fenêtre de temps
   */
  maxRequests: number;

  /**
   * Fenêtre de temps en secondes
   */
  windowSeconds: number;

  /**
   * Clé unique identifiant le client (ex: IP, email, etc.)
   */
  key: string;
}

/**
 * Résultat de la vérification du rate limiting
 */
export interface RateLimitResult {
  /**
   * true si la requête est autorisée, false si limite atteinte
   */
  allowed: boolean;

  /**
   * Nombre de requêtes restantes dans la fenêtre actuelle
   */
  remaining: number;

  /**
   * Timestamp de réinitialisation du compteur (epoch ms)
   */
  resetAt: number;
}

/**
 * Vérifie et applique le rate limiting pour une clé donnée
 * Utilise PostgreSQL pour la persistance
 *
 * @example
 * ```typescript
 * const result = await checkRateLimit({
 *   key: `auth:${ip}`,
 *   maxRequests: 5,
 *   windowSeconds: 60
 * });
 *
 * if (!result.allowed) {
 *   return new Response("Too many requests", { status: 429 });
 * }
 * ```
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { key, maxRequests, windowSeconds } = config;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    // Nettoyer les entrées expirées (pour cette clé)
    await prisma.rateLimit.deleteMany({
      where: {
        key,
        expiresAt: { lt: now },
      },
    });

    // Incrément atomique (évite les races findUnique/create avec clé UNIQUE).
    // - Si la ligne existe et count < maxRequests: +1
    // - Si la ligne existe et count >= maxRequests: bloqué
    // - Si la ligne n'existe pas: create (et retry si race)
    for (let attempt = 0; attempt < 2; attempt++) {
      const updateResult = await prisma.rateLimit.updateMany({
        where: {
          key,
          expiresAt: { gt: now },
          count: { lt: maxRequests },
        },
        data: { count: { increment: 1 } },
      });

      if (updateResult.count === 1) {
        const updated = await prisma.rateLimit.findUnique({ where: { key } });
        if (!updated) {
          // Très improbable, mais on fail-open.
          return { allowed: true, remaining: maxRequests, resetAt: expiresAt.getTime() };
        }

        return {
          allowed: true,
          remaining: maxRequests - updated.count,
          resetAt: updated.expiresAt.getTime(),
        };
      }

      const existing = await prisma.rateLimit.findUnique({ where: { key } });

      if (existing) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: existing.expiresAt.getTime(),
        };
      }

      try {
        await prisma.rateLimit.create({
          data: {
            key,
            count: 1,
            expiresAt,
          },
        });

        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetAt: expiresAt.getTime(),
        };
      } catch (error) {
        // Conflit de création concurrente: retry une fois (la ligne existe désormais).
        if ((error as { code?: string }).code === "P2002") continue;
        throw error;
      }
    }

    // Fallback: fail-open
    return { allowed: true, remaining: maxRequests, resetAt: expiresAt.getTime() };

  } catch (error) {
    console.error("Erreur lors de la vérification du rate limit:", error);

    // En cas d'erreur DB, autoriser la requête (fail-open)
    // Alternative: fail-closed en retournant { allowed: false }
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: expiresAt.getTime()
    };
  }
}

/**
 * Nettoie toutes les entrées de rate limit expirées
 * À appeler périodiquement (ex: cron job)
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  try {
    const result = await prisma.rateLimit.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    return result.count;
  } catch (error) {
    console.error("Erreur lors du nettoyage des rate limits:", error);
    return 0;
  }
}

/**
 * Réinitialise le rate limit pour une clé donnée
 * Utile pour tests ou déblocage manuel
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await prisma.rateLimit.delete({
      where: { key }
    });
  } catch (error) {
    // Ignorer si la clé n'existe pas
    if ((error as { code?: string }).code !== 'P2025') {
      console.error("Erreur lors de la réinitialisation du rate limit:", error);
    }
  }
}
