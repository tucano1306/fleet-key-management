# 🔐 Configuración de Secrets para GitHub Actions + Vercel

Esta guía te ayudará a configurar los secrets necesarios para que los workflows de GitHub Actions funcionen correctamente con Vercel.

## 📋 Secrets Requeridos

Los siguientes secrets deben configurarse en tu repositorio de GitHub:

### 1. VERCEL_TOKEN
**Descripción**: Token de autenticación para Vercel CLI

**Cómo obtenerlo**:
1. Ve a [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click en **Create Token**
3. Nombre: `GitHub Actions`
4. Scope: **Full Account**
5. Expiration: **No Expiration** (o configura según tu política)
6. Click **Create Token**
7. **¡COPIA EL TOKEN INMEDIATAMENTE!** (solo se muestra una vez)

### 2. VERCEL_ORG_ID
**Descripción**: ID de tu organización/cuenta en Vercel

**Cómo obtenerlo**:

**Opción A - Desde Vercel CLI**:
```powershell
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Link al proyecto
vercel link

# El ORG_ID estará en .vercel/project.json
cat .vercel/project.json
```

**Opción B - Desde Vercel Dashboard**:
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → General
3. Busca "Team ID" o "Organization ID"
4. Copia el valor (ej: `team_xxxxxxxxxxxxx`)

### 3. VERCEL_PROJECT_ID
**Descripción**: ID de tu proyecto en Vercel

**Cómo obtenerlo**:

**Opción A - Desde Vercel CLI**:
```powershell
# Después de ejecutar: vercel link
cat .vercel/project.json

# Verás algo como:
# {
#   "orgId": "team_xxxxx",
#   "projectId": "prj_xxxxx"
# }
```

**Opción B - Desde Vercel Dashboard**:
1. Ve a tu proyecto en Vercel
2. Settings → General
3. Busca "Project ID"
4. Copia el valor (ej: `prj_xxxxxxxxxxxxx`)

### 4. DATABASE_URL (Opcional para migrations en CI)
**Descripción**: URL de conexión a PostgreSQL de producción

**Cómo obtenerlo**:
1. Ve a Vercel Dashboard → Storage → Tu Database
2. Copia el valor de `POSTGRES_PRISMA_URL`
3. O genera desde: Project → Settings → Environment Variables

**Formato**:
```
postgresql://user:password@host:5432/database?schema=public&pgbouncer=true&connection_limit=1
```

---

## 🔧 Configurar Secrets en GitHub

### Método GUI (Recomendado)

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú izquierdo: **Secrets and variables** → **Actions**
4. Click en **New repository secret**
5. Agrega cada secret:

```
Name: VERCEL_TOKEN
Value: [pega-tu-token-aquí]
```

```
Name: VERCEL_ORG_ID
Value: [pega-tu-org-id-aquí]
```

```
Name: VERCEL_PROJECT_ID
Value: [pega-tu-project-id-aquí]
```

```
Name: DATABASE_URL
Value: [pega-tu-database-url-aquí]
```

6. Click **Add secret**

### Método CLI (Usando GitHub CLI)

```powershell
# Instalar GitHub CLI
winget install GitHub.cli

# Login
gh auth login

# Agregar secrets
gh secret set VERCEL_TOKEN
# Pega el valor cuando te lo pida

gh secret set VERCEL_ORG_ID
# Pega el valor cuando te lo pida

gh secret set VERCEL_PROJECT_ID
# Pega el valor cuando te lo pida

gh secret set DATABASE_URL
# Pega el valor cuando te lo pida
```

---

## ✅ Verificar Configuración

### 1. Verificar que los secrets existen

```powershell
# Listar secrets (solo muestra nombres, no valores)
gh secret list
```

Deberías ver:
```
VERCEL_TOKEN        Updated 2024-11-04
VERCEL_ORG_ID       Updated 2024-11-04
VERCEL_PROJECT_ID   Updated 2024-11-04
DATABASE_URL        Updated 2024-11-04
```

### 2. Probar el workflow

**Opción A - Trigger manual**:
1. Ve a Actions en GitHub
2. Selecciona "Deploy to Vercel"
3. Click "Run workflow"
4. Selecciona `main` branch
5. Environment: `preview` o `production`
6. Click "Run workflow"

**Opción B - Push a main**:
```powershell
git commit --allow-empty -m "test: Trigger CI/CD"
git push origin main
```

### 3. Revisar logs

1. Ve a **Actions** en GitHub
2. Click en el workflow que se está ejecutando
3. Revisa cada step
4. Si hay errores, verifica los secrets

---

## 🔍 Troubleshooting

### ❌ Error: "VERCEL_TOKEN not found"

**Solución**:
1. Verifica que el secret existe: `gh secret list`
2. Revisa que el nombre sea exactamente `VERCEL_TOKEN` (case-sensitive)
3. Regenera el token en Vercel y actualiza el secret

### ❌ Error: "Project not found"

**Solución**:
1. Verifica `VERCEL_PROJECT_ID` y `VERCEL_ORG_ID`
2. Ejecuta `vercel link` localmente y copia los valores de `.vercel/project.json`
3. Actualiza los secrets en GitHub

### ❌ Error: "Invalid token"

**Solución**:
1. El token expiró o fue revocado
2. Ve a Vercel → Account → Tokens
3. Crea un nuevo token
4. Actualiza el secret `VERCEL_TOKEN` en GitHub

### ❌ Error: "Database connection failed"

**Solución**:
1. Verifica que `DATABASE_URL` sea correcta
2. Asegúrate de usar `POSTGRES_PRISMA_URL` de Vercel
3. Incluye los parámetros: `?schema=public&pgbouncer=true&connection_limit=1`

---

## 📊 Workflows Configurados

Una vez configurados los secrets, estos workflows funcionarán automáticamente:

### 1. **CI** (`.github/workflows/ci.yml`)
- ✅ Se ejecuta en cada push y PR
- ✅ Builds, tests, type-check
- ✅ Usa PostgreSQL en CI

### 2. **Deploy to Vercel** (`.github/workflows/deploy.yml`)
- ✅ Preview deployments en PRs
- ✅ Production deployment en push a `main`
- ✅ Ejecuta migraciones automáticamente
- ✅ Comenta en PRs con URL de preview

### 3. **Code Quality** (`.github/workflows/code-quality.yml`)
- ✅ Security audit
- ✅ Dependency analysis
- ✅ Code analysis
- ✅ Performance checks

### 4. **Vercel Preview Comment** (`.github/workflows/vercel-preview-comment.yml`)
- ✅ Comenta en PRs con info de deployment
- ✅ Links directos a páginas importantes
- ✅ Credenciales de prueba

---

## 🔄 Actualizar Secrets

Si necesitas actualizar un secret:

**Método GUI**:
1. GitHub → Repository → Settings → Secrets and variables → Actions
2. Click en el secret que quieres actualizar
3. Click "Update secret"
4. Pega el nuevo valor
5. Click "Update secret"

**Método CLI**:
```powershell
gh secret set NOMBRE_DEL_SECRET
# Pega el nuevo valor
```

---

## 🔐 Seguridad

### ✅ Mejores Prácticas

- ✅ **Nunca** commits secrets en el código
- ✅ **Nunca** imprimas secrets en logs
- ✅ Rota tokens periódicamente (cada 3-6 meses)
- ✅ Usa tokens con el menor scope posible
- ✅ Revoca tokens inmediatamente si se comprometen
- ✅ Audita el acceso a secrets regularmente

### 🚫 Evitar

- ❌ Compartir secrets por email/chat
- ❌ Reutilizar secrets entre proyectos
- ❌ Usar tokens sin expiración en producción
- ❌ Dar acceso de admin innecesariamente

---

## 📚 Referencias

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI Tokens](https://vercel.com/docs/cli#commands/overview/unique-options/token)
- [Vercel Project Linking](https://vercel.com/docs/cli#project-linking)
- [GitHub CLI Secrets](https://cli.github.com/manual/gh_secret)

---

## ✅ Checklist Final

Antes de hacer tu primer deployment, verifica:

- [ ] `VERCEL_TOKEN` configurado en GitHub Secrets
- [ ] `VERCEL_ORG_ID` configurado en GitHub Secrets
- [ ] `VERCEL_PROJECT_ID` configurado en GitHub Secrets
- [ ] `DATABASE_URL` configurado en GitHub Secrets (opcional)
- [ ] Proyecto vinculado en Vercel Dashboard
- [ ] Database PostgreSQL creada en Vercel
- [ ] Environment variables configuradas en Vercel
- [ ] Primer deployment manual exitoso desde Vercel
- [ ] Workflows de GitHub Actions habilitados
- [ ] Primer deployment automático desde GitHub exitoso

---

**¡Listo! Ahora tus workflows de GitHub Actions están completamente integrados con Vercel.** 🚀
