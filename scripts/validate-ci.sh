#!/bin/bash
# Script de Validación Local para CI
# Simula los pasos que se ejecutarán en GitHub Actions

set -e  # Exit on error

echo -e "\033[0;36m🔍 Validando configuración de CI...\033[0m"
echo ""

# Verificar que existe .env
if [ ! -f ".env" ]; then
    echo -e "\033[0;31m❌ ERROR: Archivo .env no encontrado\033[0m"
    echo -e "\033[0;33m   Crea uno basado en .env.example\033[0m"
    exit 1
fi

# Verificar DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    echo -e "\033[0;31m❌ ERROR: DATABASE_URL no está definido en .env\033[0m"
    exit 1
fi
echo -e "\033[0;32m✅ DATABASE_URL configurado\033[0m"

# 1. Validar esquema de Prisma
echo ""
echo -e "\033[0;36m📋 Paso 1: Validando esquema de Prisma...\033[0m"
npx prisma validate
echo -e "\033[0;32m✅ Esquema de Prisma válido\033[0m"

# 2. Generar Prisma Client
echo ""
echo -e "\033[0;36m📋 Paso 2: Generando Prisma Client...\033[0m"
npx prisma generate
echo -e "\033[0;32m✅ Prisma Client generado\033[0m"

# 3. TypeScript type check
echo ""
echo -e "\033[0;36m📋 Paso 3: Verificando tipos de TypeScript...\033[0m"
npx tsc --noEmit
echo -e "\033[0;32m✅ Tipos de TypeScript correctos\033[0m"

# 4. Build Next.js
echo ""
echo -e "\033[0;36m📋 Paso 4: Compilando aplicación Next.js...\033[0m"
npm run build
echo -e "\033[0;32m✅ Build exitoso\033[0m"

# Resumen final
echo ""
echo -e "\033[0;32m═══════════════════════════════════════════\033[0m"
echo -e "\033[0;32m✅ TODAS LAS VALIDACIONES PASARON\033[0m"
echo -e "\033[0;32m═══════════════════════════════════════════\033[0m"
echo ""
echo -e "\033[0;36mTu código está listo para commit/push!\033[0m"
echo -e "\033[0;36mGitHub Actions debería pasar sin problemas.\033[0m"
