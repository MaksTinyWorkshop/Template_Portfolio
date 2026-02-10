# Déploiement Docker - Portfolio Max

## Vue d'ensemble

Ce guide explique comment déployer Portfolio Max en production à l'aide de Docker et Docker Compose. La configuration utilise un Dockerfile multi-stage optimisé pour Next.js avec output standalone.

---

## Prérequis

- **Docker** : Version 20.10+
- **Docker Compose** : Version 2.0+
- Fichier `.env` configuré avec les variables d'environnement

---

## Architecture Docker

### Dockerfile Multi-Stage

Le `Dockerfile` utilise 3 stages pour optimiser la taille et la sécurité :

1. **deps** : Installation des dépendances de production uniquement
2. **builder** : Build de l'application Next.js en mode standalone
3. **runner** : Image finale minimale avec utilisateur non-root

**Avantages** :
- ✅ Image finale ultra-légère (~150MB)
- ✅ Sécurité renforcée (utilisateur non-root)
- ✅ Build optimisé avec cache Docker
- ✅ Health check intégré

---

## Configuration Rapide

### 1. Préparer l'Environnement

Créer un fichier `.env` à la racine du projet (ne pas commiter) :

```env
# REQUIS
ADMIN_PASSWORD_HASH=<votre_hash_bcrypt>

# OPTIONNEL
NEXT_PUBLIC_SITE_URL=https://votredomaine.com
NEXT_PUBLIC_MAILCHIMP_ACTION_URL=
NEXT_PUBLIC_MAILCHIMP_USER_ID=
NEXT_PUBLIC_MAILCHIMP_FORM_ID=
JWT_SECRET=<secret_aleatoire_32_chars>
```

**Générer le hash du mot de passe** :
```bash
node -e "console.log(require('bcrypt').hashSync('votre-mot-de-passe', 10))"
```

**Générer un JWT_SECRET** :
```bash
openssl rand -base64 32
```

---

### 2. Build et Démarrage

#### Option A : Docker Compose (Recommandé)

```bash
# Build l'image et démarre le conteneur
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

#### Option B : Docker directement

```bash
# Build l'image
docker build -t portfolio-max:latest .

# Démarrer le conteneur
docker run -d \
  --name portfolio-max \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/public/images:/app/public/images \
  portfolio-max:latest

# Vérifier les logs
docker logs -f portfolio-max

# Arrêter
docker stop portfolio-max
docker rm portfolio-max
```

---

### 3. Accéder à l'Application

- **Site public** : [http://localhost:3000](http://localhost:3000)
- **Admin** : [http://localhost:3000/admin](http://localhost:3000/admin)
- **Health check** : [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## Configuration Avancée

### Variables d'Environnement

Le conteneur utilise les variables suivantes (définies dans `.env`) :

| Variable | Description | Requis | Défaut |
|----------|-------------|--------|--------|
| `ADMIN_PASSWORD_HASH` | Hash bcrypt du mot de passe admin | ✅ Oui | - |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site | Non | `http://localhost:3000` |
| `NEXT_PUBLIC_MAILCHIMP_*` | Configuration newsletter Mailchimp | Non | - |
| `JWT_SECRET` | Secret pour signer les JWT | Non | Auto-généré |
| `NODE_ENV` | Environnement Node.js | Auto | `production` |

---

### Volumes Persistants

Le `docker-compose.yml` monte deux volumes :

```yaml
volumes:
  # Données (availability.json, etc.)
  - ./data:/app/data

  # Images uploadées via l'admin
  - ./public/images:/app/public/images
```

**Important** : Ces volumes préservent les données entre les redémarrages du conteneur.

---

### Health Check

Un health check est configuré pour vérifier l'état de l'application :

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "..."]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Vérifier manuellement** :
```bash
curl http://localhost:3000/api/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T10:00:00.000Z",
  "uptime": 123.45
}
```

---

### Limites de Ressources

Par défaut, le conteneur est limité à :
- **CPU** : Max 1 core, réservé 0.5 core
- **Mémoire** : Max 1GB, réservé 512MB

Ajuster dans `docker-compose.yml` si nécessaire :

```yaml
deploy:
  resources:
    limits:
      cpus: '2'          # Augmenter si besoin
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

---

## Production avec Reverse Proxy

### Nginx + Docker Compose

**Fichier `docker-compose.prod.yml`** :

```yaml
version: '3.8'

services:
  app:
    extends:
      file: docker-compose.yml
      service: app
    environment:
      - NEXT_PUBLIC_SITE_URL=https://votredomaine.com
    networks:
      - web

  nginx:
    image: nginx:alpine
    container_name: portfolio-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - web

networks:
  web:
    driver: bridge
```

**Exemple `nginx.conf`** :

```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server app:3000;
    }

    server {
        listen 80;
        server_name votredomaine.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name votredomaine.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

**Démarrer** :
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

### Traefik (Alternative Moderne)

**Fichier `docker-compose.traefik.yml`** :

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./acme.json:/acme.json
    networks:
      - web

  app:
    extends:
      file: docker-compose.yml
      service: app
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portfolio.rule=Host(`votredomaine.com`)"
      - "traefik.http.routers.portfolio.entrypoints=websecure"
      - "traefik.http.routers.portfolio.tls.certresolver=letsencrypt"
      - "traefik.http.services.portfolio.loadbalancer.server.port=3000"
    networks:
      - web

networks:
  web:
    external: true
```

---

## Commandes Utiles

### Gestion du Conteneur

```bash
# Voir les logs
docker-compose logs -f app

# Redémarrer
docker-compose restart app

# Rebuild après changements
docker-compose up -d --build

# Supprimer tout (attention: perte de données)
docker-compose down -v

# Entrer dans le conteneur
docker-compose exec app sh
```

### Monitoring

```bash
# Voir les ressources utilisées
docker stats portfolio-max

# Inspecter le conteneur
docker inspect portfolio-max

# Vérifier le health
docker inspect --format='{{.State.Health.Status}}' portfolio-max
```

### Nettoyage

```bash
# Supprimer images inutilisées
docker image prune -a

# Nettoyer tout Docker
docker system prune -a --volumes
```

---

## Optimisations de Performance

### 1. Multi-core CPU

Ajuster le nombre de workers Node.js :

```yaml
# docker-compose.yml
environment:
  - NODE_OPTIONS=--max-old-space-size=2048 --max-workers=4
```

### 2. Cache Build Docker

Utiliser BuildKit pour des builds plus rapides :

```bash
DOCKER_BUILDKIT=1 docker build -t portfolio-max:latest .
```

### 3. Registry Privé

Pour déploiements multiples, utiliser un registry :

```bash
# Tag l'image
docker tag portfolio-max:latest registry.example.com/portfolio-max:latest

# Push vers le registry
docker push registry.example.com/portfolio-max:latest

# Pull sur le serveur de prod
docker pull registry.example.com/portfolio-max:latest
```

---

## Déploiement Cloud

### AWS ECS (Elastic Container Service)

1. Push l'image vers ECR
2. Créer une task definition avec `Dockerfile`
3. Déployer sur ECS Fargate

### Google Cloud Run

```bash
# Build et push
gcloud builds submit --tag gcr.io/PROJECT_ID/portfolio-max

# Deploy
gcloud run deploy portfolio-max \
  --image gcr.io/PROJECT_ID/portfolio-max \
  --platform managed \
  --region europe-west1 \
  --set-env-vars ADMIN_PASSWORD_HASH=xxx
```

### DigitalOcean App Platform

1. Connecter le repository GitHub
2. DigitalOcean détecte automatiquement le `Dockerfile`
3. Configurer les variables d'environnement
4. Déployer

---

## Sécurité

### Bonnes Pratiques

✅ **Utilisateur non-root** : Le conteneur tourne avec l'utilisateur `nextjs` (UID 1001)
✅ **Secrets** : Jamais commiter `.env` ou secrets dans Git
✅ **HTTPS** : Toujours utiliser SSL en production (via reverse proxy)
✅ **Firewall** : Limiter l'accès au port 3000 (uniquement reverse proxy)
✅ **Updates** : Mettre à jour régulièrement l'image de base

### Scan de Vulnérabilités

```bash
# Avec Docker Scout
docker scout cves portfolio-max:latest

# Avec Trivy
trivy image portfolio-max:latest
```

---

## Troubleshooting

### Le conteneur ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs app

# Vérifier la configuration
docker-compose config

# Vérifier les variables d'env
docker-compose exec app env
```

### Problèmes de permissions

```bash
# Donner les bonnes permissions aux volumes
chmod -R 755 data public/images
```

### Health check échoue

```bash
# Tester manuellement
curl http://localhost:3000/api/health

# Vérifier si Next.js a démarré
docker-compose exec app ps aux
```

### Erreur de mémoire

Augmenter les limites dans `docker-compose.yml` ou `.env` :

```yaml
deploy:
  resources:
    limits:
      memory: 2G
```

---

## CI/CD

### GitHub Actions

**Fichier `.github/workflows/docker.yml`** :

```yaml
name: Docker Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: user/portfolio-max:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Sauvegarde et Restauration

### Backup

```bash
# Créer une sauvegarde des données
tar -czf backup-$(date +%Y%m%d).tar.gz data/ public/images/

# Avec Docker volumes
docker run --rm \
  -v portfolio_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

### Restore

```bash
# Restaurer depuis backup
tar -xzf backup-20260131.tar.gz

# Redémarrer le conteneur
docker-compose restart app
```

---

## Monitoring

### Prometheus + Grafana (Optionnel)

Ajouter au `docker-compose.yml` :

```yaml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Ressources Additionnelles

- **Next.js Docker** : [nextjs.org/docs/deployment#docker-image](https://nextjs.org/docs/deployment#docker-image)
- **Docker Compose** : [docs.docker.com/compose](https://docs.docker.com/compose/)
- **Docker Best Practices** : [docs.docker.com/develop/dev-best-practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Dernière mise à jour** : 2026-01-31
**Version** : 1.0
