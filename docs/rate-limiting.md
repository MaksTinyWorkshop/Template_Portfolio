# Rate Limiting - Documentation

## Vue d'ensemble

Le système de rate limiting protège l'application contre les abus et attaques par déni de service (DoS). Il utilise **PostgreSQL** comme backend de stockage pour la persistance et la cohérence entre les instances.

---

## Architecture

### Modèle de données

**Table Prisma** : `RateLimit`

```prisma
model RateLimit {
  id        String   @id @default(uuid())
  key       String   @unique
  count     Int      @default(1)
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([key, expiresAt])
}
```

### Service de rate limiting

**Fichier** : [`src/lib/utils/rate-limit.ts`](../src/lib/utils/rate-limit.ts)

**Fonction principale** : `checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult>`

---

## Configuration par route

### 1. `/api/authenticate` - Authentification admin

**Protection contre** : Attaques brute force sur le mot de passe admin

**Limites** :
- **5 tentatives maximum** par IP
- Fenêtre de **60 secondes**
- Clé : `auth:{ip}`

**Implémentation** : [`src/app/(api)/api/authenticate/route.ts:27-49`](../src/app/(api)/api/authenticate/route.ts#L27-L49)

```typescript
const rateLimitResult = await checkRateLimit({
  key: `auth:${ip}`,
  maxRequests: 5,
  windowSeconds: 60
});
```

**Réponse si limite atteinte** :
```json
{
  "message": "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
  "retryAfter": 42
}
```

**Headers HTTP** :
- `Retry-After`: Secondes avant réinitialisation
- `X-RateLimit-Limit`: Limite maximale
- `X-RateLimit-Remaining`: Requêtes restantes
- `X-RateLimit-Reset`: Timestamp de réinitialisation (epoch seconds)

---

### 2. `/api/contact` - Formulaire de contact

**Protection contre** : Spam et abus du formulaire de contact

**Limites** :
- **3 messages maximum** par IP
- Fenêtre de **300 secondes (5 minutes)**
- Clé : `contact:{ip}`

**Implémentation** : [`src/app/(api)/api/contact/route.ts:14-42`](../src/app/(api)/api/contact/route.ts#L14-L42)

```typescript
const rateLimitResult = await checkRateLimit({
  key: `contact:${ip}`,
  maxRequests: 3,
  windowSeconds: 300 // 5 minutes
});
```

**Réponse si limite atteinte** :
```json
{
  "error": "Trop de messages envoyés. Veuillez patienter avant de réessayer.",
  "retryAfter": 180
}
```

---

## Détection de l'IP client

Le système détecte l'IP du client en vérifiant les headers dans cet ordre :

1. `x-forwarded-for` (premier IP si liste)
2. `x-real-ip`
3. Fallback : `"unknown"`

**Important** : Assurez-vous que votre reverse proxy (Traefik, Nginx, etc.) est configuré pour passer les bons headers.

### Configuration Traefik

Le fichier `docker-compose.yml` utilise déjà Traefik qui transmet automatiquement les headers `X-Forwarded-For` et `X-Real-IP`.

**Vérification** :
```typescript
const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
           request.headers.get("x-real-ip") ||
           "unknown";
```

---

## Utilisation dans vos propres routes

### Exemple basique

```typescript
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const result = await checkRateLimit({
    key: `my-route:${ip}`,
    maxRequests: 10,
    windowSeconds: 60
  });

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) }
      }
    );
  }

  // Votre logique métier ici...
  return NextResponse.json({ success: true });
}
```

### Exemple avec clé personnalisée

```typescript
// Rate limit par utilisateur authentifié
const userId = await getUserId(request);
const result = await checkRateLimit({
  key: `api-calls:user:${userId}`,
  maxRequests: 100,
  windowSeconds: 3600 // 1 heure
});

// Rate limit par endpoint ET IP
const endpoint = request.nextUrl.pathname;
const ip = getClientIp(request);
const result = await checkRateLimit({
  key: `${endpoint}:${ip}`,
  maxRequests: 20,
  windowSeconds: 60
});
```

---

## Maintenance

### Nettoyage des entrées expirées

Les entrées expirées sont automatiquement supprimées lors de chaque vérification pour la clé concernée.

**Nettoyage global** (optionnel) :

```typescript
import { cleanupExpiredRateLimits } from "@/lib/utils/rate-limit";

// Appeler périodiquement (ex: cron job)
const deletedCount = await cleanupExpiredRateLimits();
console.log(`${deletedCount} entrées de rate limit nettoyées`);
```

**Cron job suggéré** (toutes les heures) :

```typescript
// scripts/cleanup-rate-limits.ts
import { cleanupExpiredRateLimits } from "@/lib/utils/rate-limit";

async function main() {
  const count = await cleanupExpiredRateLimits();
  console.log(`[${new Date().toISOString()}] Nettoyé ${count} entrées expirées`);
}

main();
```

Ajouter à `package.json` :
```json
{
  "scripts": {
    "cleanup:rate-limits": "tsx scripts/cleanup-rate-limits.ts"
  }
}
```

---

## Déblocage manuel

### Réinitialiser une IP spécifique

```typescript
import { resetRateLimit } from "@/lib/utils/rate-limit";

// Débloquer une IP
await resetRateLimit("auth:192.168.1.100");
await resetRateLimit("contact:192.168.1.100");
```

### Endpoint admin (optionnel)

Créer une route admin pour débloquer des IPs :

```typescript
// src/app/(api)/api/admin/reset-rate-limit/route.ts
import { NextResponse } from "next/server";
import { checkAuthAPI } from "@/lib/utils/auth";
import { resetRateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: Request) {
  const isAuth = await checkAuthAPI();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await request.json();
  await resetRateLimit(key);

  return NextResponse.json({ success: true });
}
```

---

## Monitoring

### Logs

Les erreurs de rate limiting sont loggées automatiquement :

```typescript
console.error("Erreur lors de la vérification du rate limit:", error);
```

### Métriques recommandées

Pour un monitoring avancé, ajoutez des métriques :

```typescript
// Exemple avec un service de métriques (Prometheus, Datadog, etc.)
if (!rateLimitResult.allowed) {
  metrics.increment("rate_limit.blocked", { route: "auth" });
}
```

---

## Performances

### Optimisations PostgreSQL

L'index composite `[key, expiresAt]` optimise :
- Recherche par clé (lookup)
- Suppression des entrées expirées

```sql
CREATE INDEX idx_ratelimit_key_expiresat ON "RateLimit"("key", "expiresAt");
```

### Charge attendue

Pour un portfolio personnel :
- **Charge faible** : < 100 vérifications/minute
- **Impact PostgreSQL** : Négligeable
- **Latence** : +5-10ms par requête

Pour une application à fort trafic, considérer **Redis** (voir note ci-dessous).

---

## Migration vers Redis (si nécessaire)

Si votre trafic augmente significativement (>1000 req/min), migrez vers Redis :

**Alternative avec Upstash Redis** :

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});

const { success, reset } = await ratelimit.limit(`auth:${ip}`);
```

---

## Sécurité

### Stratégie "Fail-Open"

En cas d'erreur de base de données, le système **autorise la requête** par défaut :

```typescript
catch (error) {
  console.error("Erreur lors de la vérification du rate limit:", error);
  return { allowed: true, ... }; // Fail-open
}
```

**Alternative "Fail-Closed"** (plus stricte) :
```typescript
return { allowed: false, ... }; // Bloque en cas d'erreur
```

### Protection contre les contournements

- ✅ Utilise les headers proxy (`x-forwarded-for`)
- ✅ Fallback sur `x-real-ip`
- ⚠️ Un attaquant avec accès direct (sans proxy) peut contourner

**Recommandation production** : Toujours utiliser un reverse proxy (Traefik, Nginx).

---

## Troubleshooting

### "Too many requests" alors que je n'ai fait qu'une tentative

**Causes possibles** :
1. L'IP est partagée (VPN, proxy d'entreprise)
2. Des entrées expirées n'ont pas été nettoyées
3. Le temps serveur est désynchronisé

**Solutions** :
```bash
# Vérifier la table RateLimit
psql $DATABASE_URL -c "SELECT * FROM \"RateLimit\";"

# Réinitialiser manuellement
psql $DATABASE_URL -c "DELETE FROM \"RateLimit\" WHERE key LIKE 'auth:%';"
```

### Headers rate limit manquants

Vérifiez que votre reverse proxy transmet bien les headers :

```bash
# Test avec curl
curl -I -X POST https://votre-domaine.com/api/authenticate

# Vérifier les headers retournés
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
Retry-After: 60
```

---

## Tests

### Test manuel avec curl

```bash
# Tester authentication (devrait bloquer après 5 tentatives)
for i in {1..6}; do
  echo "Tentative $i:"
  curl -X POST http://localhost:3000/api/authenticate \
    -H "Content-Type: application/json" \
    -d '{"password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done

# Tester contact (devrait bloquer après 3 messages)
for i in {1..4}; do
  echo "Message $i:"
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","message":"Test message"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

### Tests unitaires

Voir [`tests/http/rate-limit.test.ts`](../tests/http/rate-limit.test.ts) (à créer).

---

## Changelog

- **2026-02-08** : Implémentation initiale avec PostgreSQL
  - Route `/api/authenticate` : 5 req/60s
  - Route `/api/contact` : 3 req/300s

---

## Références

- [Prisma Schema](../prisma/schema.prisma)
- [Service Rate Limit](../src/lib/utils/rate-limit.ts)
- [Route Authenticate](../src/app/(api)/api/authenticate/route.ts)
- [Route Contact](../src/app/(api)/api/contact/route.ts)
