# 🚀 Deploy Rápido con Vercel CLI

Ya tienes Vercel CLI instalado y autenticado ✅

## Opción 1: Deploy de Preview (Recomendado para empezar)

```powershell
vercel
```

Esto creará un deployment de prueba sin afectar producción.
Te dará una URL como: `https://fleet-key-management-abc123.vercel.app`

## Opción 2: Deploy Directo a Producción

```powershell
vercel --prod
```

Esto deployará directamente a tu URL de producción.

## Primera Vez: Configuración

Cuando ejecutes `vercel` por primera vez, te preguntará:

```
? Set up and deploy "C:\Users\tucan\Desktop\app-key"? Y
? Which scope? [Selecciona tu cuenta]
? Link to existing project? N
? What's your project's name? fleet-key-management
? In which directory is your code located? ./
```

## Después del Deploy

1. **Conectar Base de Datos**:
   - Ve a Vercel Dashboard
   - Storage → Create Database → Postgres
   - Connect Store al proyecto

2. **Configurar Variables de Entorno**:
   ```powershell
   # Genera un secret
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```
   
   - Ve a Project Settings → Environment Variables
   - Agrega:
     - `NEXTAUTH_SECRET`: [el secret generado]
     - `NEXTAUTH_URL`: [tu URL de Vercel]

3. **Ejecutar Migraciones**:
   ```powershell
   vercel env pull .env.production
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Comandos Útiles

```powershell
# Ver tus deployments
vercel ls

# Ver logs en tiempo real
vercel logs --follow

# Abrir dashboard
vercel dashboard

# Vincular a proyecto existente
vercel link
```

## ¿Qué Comando Usar?

| Situación | Comando |
|-----------|---------|
| Primera vez | `vercel` (preview) |
| Testing cambios | `vercel` |
| Ya probado, ir a producción | `vercel --prod` |
| Ver si funcionó | `vercel logs --follow` |
| Abrir en navegador | `vercel open` |

## Ahora Ejecuta:

```powershell
# Para empezar con preview:
vercel

# O si estás seguro, directo a producción:
vercel --prod
```
