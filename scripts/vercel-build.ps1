# PowerShell script for Vercel deployment
# Run migrations and build

Write-Host "🚀 Starting Vercel Build Process..." -ForegroundColor Cyan

# 1. Generate Prisma Client
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 2. Run migrations (solo en production)
if ($env:VERCEL_ENV -eq "production") {
    Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate deploy
} else {
    Write-Host "⏭️  Skipping migrations (not production)" -ForegroundColor Gray
}

# 3. Build Next.js
Write-Host "🏗️  Building Next.js application..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
