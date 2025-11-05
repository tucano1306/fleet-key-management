# 🚀 Quick Deployment Guide - Vercel

## Deployment Rápido (5 minutos)

### 1️⃣ Crear Base de Datos en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **Postgres**
3. Nombre: `fleet-key-db`
4. Click **Create**

### 2️⃣ Deploy desde GitHub

1. En Vercel Dashboard: **Add New** → **Project**
2. Importa: `tucano1306/fleet-key-management`
3. Click **Deploy** (¡sí, así de simple!)

### 3️⃣ Conectar Database

1. Ve a tu proyecto en Vercel
2. **Storage** tab → **Connect Store**
3. Selecciona tu database `fleet-key-db`
4. Vercel conectará automáticamente las variables

### 4️⃣ Configurar Variables de Entorno

Solo necesitas agregar 2 variables manualmente:

**Settings** → **Environment Variables**:

```bash
# 1. NEXTAUTH_SECRET (genera uno nuevo)
NEXTAUTH_SECRET=copia-el-resultado-del-comando-abajo

# 2. NEXTAUTH_URL (tu URL de Vercel)
NEXTAUTH_URL=https://tu-proyecto.vercel.app
```

**Generar NEXTAUTH_SECRET** en PowerShell local:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 5️⃣ Ejecutar Migraciones

**Opción A - Vercel CLI (Más fácil)**:
```powershell
# Instalar Vercel CLI
npm i -g vercel

# Login y vincular
vercel login
vercel link

# Ejecutar migraciones
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

**Opción B - Manual**:
1. Copia `DATABASE_URL` de Vercel (Settings → Environment Variables)
2. Temporalmente pégala en tu `.env` local
3. Ejecuta:
```powershell
npx prisma migrate deploy
npx prisma db seed
```

### 6️⃣ ¡Listo! 🎉

Abre tu URL: `https://tu-proyecto.vercel.app`

**Credenciales de prueba**:
- DISPATCH: ID `0000`, PIN `0000`
- Driver: Last 4 `5678`, PIN `1234`

---

## Redeploy Automático

Cada `git push` a `main` desplegará automáticamente.

## Troubleshooting Común

**Error: "Prisma Client not found"**
→ Vercel ya ejecuta `prisma generate` automáticamente (postinstall)

**Error: "Database connection failed"**
→ Verifica que la database esté conectada en Storage tab

**Migraciones no aplicadas**
→ Ejecuta manualmente con Vercel CLI (paso 5)

---

**Ver guía completa**: [DEPLOYMENT.md](./DEPLOYMENT.md)
