# Script de Validación Local para CI
# Simula los pasos que se ejecutarán en GitHub Actions

Write-Host "🔍 Validando configuración de CI..." -ForegroundColor Cyan
Write-Host ""

# Verificar que existe .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ ERROR: Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "   Crea uno basado en .env.example" -ForegroundColor Yellow
    exit 1
}

# Verificar DATABASE_URL
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "DATABASE_URL") {
    Write-Host "❌ ERROR: DATABASE_URL no está definido en .env" -ForegroundColor Red
    exit 1
}
Write-Host "✅ DATABASE_URL configurado" -ForegroundColor Green

# 1. Validar esquema de Prisma
Write-Host ""
Write-Host "📋 Paso 1: Validando esquema de Prisma..." -ForegroundColor Cyan
npx prisma validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Validación de Prisma falló" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Esquema de Prisma válido" -ForegroundColor Green

# 2. Generar Prisma Client
Write-Host ""
Write-Host "📋 Paso 2: Generando Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Generación de Prisma Client falló" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generado" -ForegroundColor Green

# 3. TypeScript type check
Write-Host ""
Write-Host "📋 Paso 3: Verificando tipos de TypeScript..." -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Verificación de tipos falló" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tipos de TypeScript correctos" -ForegroundColor Green

# 4. Build Next.js
Write-Host ""
Write-Host "📋 Paso 4: Compilando aplicación Next.js..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Build de Next.js falló" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build exitoso" -ForegroundColor Green

# Resumen final
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ TODAS LAS VALIDACIONES PASARON" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Tu código está listo para commit/push!" -ForegroundColor Cyan
Write-Host "GitHub Actions debería pasar sin problemas." -ForegroundColor Cyan
