# 🔄 GitHub Actions Workflows

Este directorio contiene todos los workflows de CI/CD para el proyecto Fleet Key Management System.

## 📋 Workflows Disponibles

### 1. 🔨 CI (Continuous Integration)
**Archivo**: `ci.yml`

**Triggers**:
- ✅ Push a `main` y `develop`
- ✅ Pull requests a `main` y `develop`
- ✅ Manual dispatch

**Jobs**:
- **build-and-test**: Compila y valida el proyecto
  - Matrix testing (Node 18.x y 20.x)
  - PostgreSQL test database
  - TypeScript type check
  - ESLint
  - Next.js build
  - Prisma migrations
  - Database seed test

- **lint**: Análisis de código
  - ESLint checks
  - Code formatting validation

- **security**: Auditoría de seguridad
  - npm audit
  - Vulnerability scanning

**Duración estimada**: 3-5 minutos

---

### 2. 🚀 Deploy to Vercel
**Archivo**: `deploy.yml`

**Triggers**:
- ✅ Push a `main` (auto-deploy a production)
- ✅ Pull requests a `main` (preview deployments)
- ✅ Manual dispatch (seleccionar environment)

**Jobs**:
- **pre-deploy-checks**: Validaciones antes del deploy
  - Type checking
  - Lint validation
  - Build verification

- **deploy-preview**: Deploy de preview (PRs)
  - Build con Vercel
  - Deploy a preview URL
  - Comentario en PR con URL

- **deploy-production**: Deploy a producción (push a main)
  - Build con Vercel
  - Deploy a production URL
  - Ejecuta migraciones de BD
  - Deployment status tracking

**Duración estimada**: 2-4 minutos

**Secrets requeridos**:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DATABASE_URL` (opcional)

---

### 3. 📊 Code Quality
**Archivo**: `code-quality.yml`

**Triggers**:
- ✅ Pull requests
- ✅ Manual dispatch
- ✅ Cron semanal (Lunes 9:00 AM UTC)

**Jobs**:
- **security-audit**: Análisis de seguridad
  - npm audit
  - Vulnerability reports
  - Artifact upload

- **dependency-check**: Análisis de dependencias
  - Outdated packages
  - Dependency tree
  - Bundle size estimation

- **code-analysis**: Análisis de código
  - ESLint
  - TypeScript check
  - Prisma validation
  - TODO/FIXME search

- **performance-check**: Análisis de performance
  - Production build
  - Bundle analysis
  - Size metrics

- **summary**: Resumen consolidado

**Duración estimada**: 5-8 minutos

---

### 4. 💬 Vercel Preview Comment
**Archivo**: `vercel-preview-comment.yml`

**Triggers**:
- ✅ Pull request opened
- ✅ Pull request synchronized

**Funcionalidad**:
- Espera a que Vercel complete el deployment
- Comenta en el PR con:
  - Preview URL
  - Quick links (login, dashboard, etc.)
  - Test credentials
  - Deployment info

**Duración estimada**: 30 segundos - 3 minutos

---

### 5. 🗄️ Post-Deploy Database Migrations
**Archivo**: `post-deploy-migrations.yml`

**Triggers**:
- ✅ Después de completar "Deploy to Vercel" workflow (main branch)
- ✅ Manual dispatch (con opción de seed)

**Jobs**:
- **migrate**: Ejecuta migraciones
  - Pull environment de Vercel
  - Check pending migrations
  - Run migrations
  - Optional database seed
  - Verify status
  - Create issue si falla

**Duración estimada**: 1-2 minutos

**Secrets requeridos**:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 🔐 Configuración de Secrets

Ver: [SECRETS_SETUP.md](./SECRETS_SETUP.md)

### Secrets Requeridos

```bash
VERCEL_TOKEN         # Token de Vercel para deployments
VERCEL_ORG_ID        # ID de organización en Vercel
VERCEL_PROJECT_ID    # ID del proyecto en Vercel
DATABASE_URL         # URL de PostgreSQL (opcional)
```

### Configurar Secrets

```powershell
# Usando GitHub CLI
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
gh secret set DATABASE_URL
```

---

## 🎯 Flujo de Trabajo Típico

### Desarrollo en Feature Branch

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... código ...

# 3. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request
# → CI workflow se ejecuta automáticamente
# → Code Quality checks
```

### Pull Request a Main

```bash
# 1. PR abierto/actualizado
# → CI workflow (build, test, lint)
# → Code Quality workflow
# → Deploy to Vercel (preview)
# → Vercel Preview Comment (URL en PR)

# 2. Review y merge
# → Al hacer merge a main:
#    ├─ CI workflow
#    ├─ Deploy to Vercel (production)
#    └─ Post-Deploy Migrations
```

### Deployment Manual

```bash
# Opción 1: GitHub UI
# 1. Ve a Actions
# 2. Selecciona "Deploy to Vercel"
# 3. Click "Run workflow"
# 4. Selecciona environment (preview/production)
# 5. Click "Run workflow"

# Opción 2: GitHub CLI
gh workflow run deploy.yml -f environment=production
```

---

## 📊 Status Badges

Agrega estos badges a tu README.md:

```markdown
[![CI](https://github.com/tucano1306/fleet-key-management/actions/workflows/ci.yml/badge.svg)](https://github.com/tucano1306/fleet-key-management/actions/workflows/ci.yml)
[![Deploy](https://github.com/tucano1306/fleet-key-management/actions/workflows/deploy.yml/badge.svg)](https://github.com/tucano1306/fleet-key-management/actions/workflows/deploy.yml)
[![Code Quality](https://github.com/tucano1306/fleet-key-management/actions/workflows/code-quality.yml/badge.svg)](https://github.com/tucano1306/fleet-key-management/actions/workflows/code-quality.yml)
```

---

## 🔍 Troubleshooting

### CI Falla en Build

**Síntomas**: Build step falla
**Soluciones**:
1. Ejecuta `npm run build` localmente
2. Verifica errores de TypeScript
3. Revisa que todas las dependencias estén en package.json
4. Verifica que Prisma client esté generado

### Deploy Falla en Vercel

**Síntomas**: Deploy step falla
**Soluciones**:
1. Verifica que los secrets estén configurados
2. Revisa que `VERCEL_TOKEN` sea válido
3. Confirma que el proyecto esté vinculado
4. Revisa logs en Vercel Dashboard

### Migrations Fallan

**Síntomas**: Post-deploy migrations falla
**Soluciones**:
1. Verifica `DATABASE_URL`
2. Ejecuta manualmente:
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```
3. Revisa Prisma migrations en `prisma/migrations/`

### Preview Comment No Aparece

**Síntomas**: No se crea comentario en PR
**Soluciones**:
1. Verifica que el deployment de Vercel se complete
2. Revisa permisos del GITHUB_TOKEN
3. Espera hasta 5 minutos para timeout

---

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs**: Actions → [Workflow] → [Run] → [Step]
2. **Busca en issues**: Puede que alguien ya haya tenido el mismo problema
3. **Crea un issue**: Incluye logs y pasos para reproducir
4. **Ejecuta manualmente**: Intenta replicar el error localmente

---

## ✅ Checklist de Configuración

Antes de tu primer deployment:

- [ ] Secrets configurados en GitHub
- [ ] Proyecto vinculado en Vercel
- [ ] Database PostgreSQL creada
- [ ] Environment variables en Vercel
- [ ] Workflows habilitados
- [ ] Primer CI run exitoso
- [ ] Primer preview deployment exitoso
- [ ] Primer production deployment exitoso
- [ ] Migraciones ejecutadas correctamente
- [ ] Status badges agregados al README

---

**¡Workflows listos para CI/CD automático!** 🚀
