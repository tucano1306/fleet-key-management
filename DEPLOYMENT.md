# 🚀 Guía de Deployment en Vercel

## Prerequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Cuenta en [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) o servicio de PostgreSQL externo
3. Repositorio en GitHub (ya configurado: `tucano1306/fleet-key-management`)

## Paso 1: Configurar Base de Datos PostgreSQL

### Opción A: Vercel Postgres (Recomendado)

1. Ve a tu [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Storage** → **Create Database** → **Postgres**
3. Asigna un nombre (ej: `fleet-key-db`)
4. Selecciona la región más cercana a tus usuarios
5. Click en **Create**
6. Vercel generará automáticamente:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` (optimizada para Prisma)
   - `POSTGRES_URL_NON_POOLING`

### Opción B: PostgreSQL Externo

Puedes usar:
- [Railway](https://railway.app/)
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)
- [PlanetScale](https://planetscale.com/)

## Paso 2: Deployment Automático desde GitHub

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Add New...** → **Project**
3. Importa tu repositorio: `tucano1306/fleet-key-management`
4. Configura el proyecto:
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (ya configurado en package.json)
   - **Output Directory**: `.next` (default)

## Paso 3: Configurar Variables de Entorno

En la sección **Environment Variables** de Vercel, agrega:

### Variables Requeridas:

```bash
# Database (usar POSTGRES_PRISMA_URL de Vercel Postgres)
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public&pgbouncer=true&connection_limit=1

# Authentication
NEXTAUTH_SECRET=generar-con-comando-abajo
NEXTAUTH_URL=https://tu-proyecto.vercel.app
```

### Generar NEXTAUTH_SECRET:

En PowerShell local, ejecuta:
```powershell
# Opción 1: Si tienes OpenSSL
openssl rand -base64 32

# Opción 2: En PowerShell puro
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Si usas Vercel Postgres:

Vercel conectará automáticamente las variables de la base de datos. Solo necesitas:
1. Vincular el proyecto a la base de datos en Storage tab
2. Vercel agregará automáticamente todas las variables `POSTGRES_*`
3. Usa `POSTGRES_PRISMA_URL` como tu `DATABASE_URL`

## Paso 4: Ejecutar Migraciones

Después del primer deployment:

### Opción A: Desde Vercel CLI (Recomendado)

```powershell
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Link al proyecto
vercel link

# Ejecutar migraciones en producción
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

### Opción B: Desde tu Local

```powershell
# Conectar a la base de datos de producción temporalmente
# Copia DATABASE_URL de Vercel → Variables de Entorno

# Ejecutar migraciones
npx prisma migrate deploy

# Ejecutar seed (datos iniciales)
npx prisma db seed
```

## Paso 5: Verificar Deployment

1. Vercel te proporcionará una URL: `https://tu-proyecto.vercel.app`
2. Abre la URL en el navegador
3. Prueba el login con las credenciales seed:
   - **DISPATCH**: ID `0000`, PIN `0000`
   - **Driver**: Last 4 `5678`, PIN `1234`

## Configuración Adicional

### Dominio Personalizado (Opcional)

1. En Vercel Dashboard → Tu Proyecto → **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura los DNS según instrucciones de Vercel

### Redeploy Automático

Cada push a `main` en GitHub triggereará un deployment automático gracias a GitHub Actions y Vercel integration.

## Variables de Entorno por Ambiente

Vercel permite configurar variables para:
- **Production**: Rama `main`
- **Preview**: Pull requests y otras ramas
- **Development**: Desarrollo local

Recomendación:
- Production: Base de datos de producción
- Preview: Base de datos de staging/test

## Troubleshooting

### Error: "Prisma Client not found"

**Solución**: Verifica que `postinstall` esté en package.json:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Error: "Database connection failed"

**Solución**: 
1. Verifica que `DATABASE_URL` tenga los parámetros correctos para Prisma:
   ```
   ?schema=public&pgbouncer=true&connection_limit=1
   ```
2. Si usas Vercel Postgres, usa `POSTGRES_PRISMA_URL`

### Error: "Middleware not found"

**Solución**: Verifica que `middleware.ts` esté en la raíz del proyecto.

### Migraciones no aplicadas

**Solución**:
```powershell
# Desde local con DATABASE_URL de producción
npx prisma migrate deploy
```

## Monitoreo

En Vercel Dashboard puedes ver:
- **Deployments**: Historial de deployments
- **Analytics**: Métricas de uso
- **Logs**: Logs en tiempo real
- **Speed Insights**: Performance de la aplicación

## Comandos Útiles

```powershell
# Ver logs en tiempo real
vercel logs --follow

# Listar proyectos
vercel list

# Abrir dashboard del proyecto
vercel dashboard

# Redeploy
vercel --prod
```

## Checklist Final ✅

- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno configuradas en Vercel
- [ ] Proyecto conectado a GitHub
- [ ] Primer deployment exitoso
- [ ] Migraciones ejecutadas
- [ ] Seed ejecutado (datos iniciales)
- [ ] Login funcional
- [ ] Dominios configurados (opcional)

## Soporte

- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**¡Listo para producción! 🎉**
