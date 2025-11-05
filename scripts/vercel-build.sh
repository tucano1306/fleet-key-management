#!/bin/bash
# Script para deployment en Vercel
# Ejecuta migraciones y build

echo "🚀 Starting Vercel Build Process..."

# 1. Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# 2. Run migrations (solo en production)
if [ "$VERCEL_ENV" = "production" ]; then
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy
else
  echo "⏭️  Skipping migrations (not production)"
fi

# 3. Build Next.js
echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
