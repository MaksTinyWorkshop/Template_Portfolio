#!/bin/sh
set -e

echo "🔧 [DB-INIT] Waiting for PostgreSQL..."

# Attendre que PostgreSQL soit vraiment prêt
until pg_isready -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; do
  echo "⏳ [DB-INIT] PostgreSQL is unavailable - sleeping..."
  sleep 2
done

echo "✅ [DB-INIT] PostgreSQL is ready!"

# Exécuter les migrations Prisma
echo "🔧 [DB-INIT] Running Prisma migrations..."
npx prisma migrate deploy

# Vérifier si la DB est vide et seed si nécessaire
echo "🔍 [DB-INIT] Checking if database needs seeding..."
COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"Person\"" 2>/dev/null | tr -d '[:space:]' || echo "0")

if [ "$COUNT" = "0" ] || [ -z "$COUNT" ]; then
  echo "🌱 [DB-INIT] Database is empty - Seeding from prisma/seed.sql..."
  psql "$DATABASE_URL" -f /app/prisma/seed.sql
  echo "✅ [DB-INIT] Database seeded successfully!"
else
  echo "✅ [DB-INIT] Database already contains data (${COUNT} persons) - Skipping seed"
fi

echo "🎉 [DB-INIT] Database initialization complete!"
