# 🚀 Comandos Rápidos - Deployment Vercel

## Instalación Inicial

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Login a Vercel
vercel login

# Vincular proyecto
vercel link
```

## Generar NEXTAUTH_SECRET

```powershell
# PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Bash (Mac/Linux)
openssl rand -base64 32
```

## Migraciones y Seed

```powershell
# Descargar variables de entorno de Vercel
vercel env pull .env.production

# Ejecutar migraciones en producción
npx prisma migrate deploy

# Cargar datos de prueba
npx prisma db seed

# Ver base de datos (local)
npx prisma studio
```

## Deployment Manual

```powershell
# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Ver logs en tiempo real
vercel logs --follow

# Abrir dashboard del proyecto
vercel dashboard
```

## Gestión de Variables de Entorno

```powershell
# Listar variables
vercel env ls

# Agregar variable
vercel env add VARIABLE_NAME

# Remover variable
vercel env rm VARIABLE_NAME

# Descargar variables
vercel env pull .env.production
```

## Comandos Útiles

```powershell
# Listar proyectos
vercel list

# Ver información del proyecto actual
vercel inspect

# Alias de dominio
vercel alias set <deployment-url> <alias>

# Cancelar deployment
vercel rm <deployment-url>
```

## Git Workflow

```powershell
# Desarrollo normal
git add .
git commit -m "feat: nueva característica"
git push origin main
# → Vercel deploya automáticamente

# Ver status de deployment
vercel ls
```

## Prisma en Producción

```powershell
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Resetear database (¡CUIDADO!)
npx prisma migrate reset

# Generar Prisma Client
npx prisma generate

# Ver schema actual
npx prisma db pull
```

## Troubleshooting

```powershell
# Ver logs del último deployment
vercel logs

# Ver logs de una función específica
vercel logs --follow

# Reiniciar deployment
vercel --force

# Limpiar caché y redeploy
vercel --force --prod
```

## Configuración Inicial Completa (Copy-Paste)

```powershell
# 1. Instalar y configurar Vercel CLI
npm install -g vercel
vercel login
vercel link

# 2. Descargar configuración de producción
vercel env pull .env.production

# 3. Ejecutar migraciones
npx prisma migrate deploy

# 4. Cargar datos de prueba
npx prisma db seed

# 5. Verificar
vercel logs --follow
```

## Variables de Entorno Requeridas en Vercel

```bash
# Agregar estas en Vercel Dashboard → Settings → Environment Variables

NEXTAUTH_SECRET=tu-secreto-generado
NEXTAUTH_URL=https://tu-proyecto.vercel.app
# DATABASE_URL se configura automáticamente al conectar Vercel Postgres
```

## Monitoreo

```powershell
# Ver analytics
vercel dashboard
# → Analytics tab

# Ver speed insights
# → Speed Insights tab en Vercel Dashboard

# Ver logs en tiempo real
vercel logs --follow
```

## Rollback a Versión Anterior

```powershell
# 1. Listar deployments
vercel ls

# 2. Promover deployment anterior a producción
vercel promote <deployment-url>

# O desde Vercel Dashboard:
# Deployments → [selecciona deployment] → Promote to Production
```

## Enlaces Rápidos

- Dashboard: https://vercel.com/dashboard
- Docs Vercel: https://vercel.com/docs
- Docs Prisma: https://www.prisma.io/docs
- Generar Secret: https://generate-secret.vercel.app/32

## Credenciales de Prueba

```
DISPATCH:
  ID: 0000
  PIN: 0000

DRIVER 1:
  Last 4: 5678
  PIN: 1234

DRIVER 2:
  Last 4: 4321
  PIN: 5678

CLEANING STAFF:
  Last 4: 3344
  PIN: 9012
```
