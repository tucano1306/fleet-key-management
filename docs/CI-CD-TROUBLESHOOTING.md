# 🔧 Solución de Problemas de CI/CD

## Error: Environment variable not found: DATABASE_URL

### Problema
```
Error: Environment variable not found: DATABASE_URL.
  -->  prisma/schema.prisma:10
   | 
 9 |   provider = "sqlite"
10 |   url      = env("DATABASE_URL")
```

### Causa
La variable de entorno `DATABASE_URL` no está configurada en el ambiente de GitHub Actions.

### ✅ Solución Implementada

El archivo `.github/workflows/ci.yml` ha sido actualizado para incluir `DATABASE_URL` a nivel de job:

```yaml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    env:
      DATABASE_URL: file:./test.db  # ✅ Agregado aquí
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
```

### 📝 Cambios Aplicados

#### 1. CI Workflow (`.github/workflows/ci.yml`)
- ✅ Agregado `DATABASE_URL: file:./test.db` al job `build-and-test`
- ✅ Agregado `DATABASE_URL: file:./test.db` al job `database`
- ✅ Agregado paso de validación de Prisma: `npx prisma validate`
- ✅ Removidas declaraciones redundantes de `env` en pasos individuales

#### 2. Archivos de Validación Local

**Para Windows (PowerShell):**
```powershell
.\scripts\validate-ci.ps1
```

**Para Linux/Mac (Bash):**
```bash
chmod +x scripts/validate-ci.sh
./scripts/validate-ci.sh
```

Estos scripts simulan localmente lo que GitHub Actions ejecutará, permitiendo detectar errores antes de hacer commit.

---

## 🧪 Validación Local Antes de Commit

### Pasos Recomendados

1. **Verificar que `.env` existe:**
   ```bash
   # Windows PowerShell
   Test-Path .env
   
   # Linux/Mac
   [ -f .env ] && echo "✅ Existe" || echo "❌ No existe"
   ```

2. **Validar esquema de Prisma:**
   ```bash
   npx prisma validate
   ```
   
   Esto verificará que el esquema sea correcto Y que `DATABASE_URL` esté configurado.

3. **Generar Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Verificar tipos de TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

5. **Build de Next.js:**
   ```bash
   npm run build
   ```

6. **Script completo (recomendado):**
   ```bash
   # Windows
   .\scripts\validate-ci.ps1
   
   # Linux/Mac
   ./scripts/validate-ci.sh
   ```

---

## 📁 Estructura de Variables de Entorno

### Desarrollo Local (`.env`)
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="development-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### CI/CD (GitHub Actions)
```yaml
env:
  DATABASE_URL: file:./test.db
```

### Producción (Vercel/Otros)
Configurar como secreto en el servicio de hosting:
```env
DATABASE_URL="file:./prod.db"
# O para PostgreSQL:
# DATABASE_URL="postgresql://user:pass@host:5432/db"
```

---

## 🔍 Verificar Estado del CI

1. **Ver logs del último workflow:**
   - Ve a: https://github.com/tucano1306/fleet-key-management/actions
   - Selecciona el workflow que falló
   - Revisa los logs de cada paso

2. **Re-ejecutar workflow:**
   - Haz clic en "Re-run all jobs" después de aplicar correcciones
   - O haz un nuevo commit para trigger automático

3. **Workflow manual:**
   ```bash
   # En GitHub, ve a Actions > CI > Run workflow
   ```

---

## ✅ Checklist de Corrección

- [x] `DATABASE_URL` agregado al job `build-and-test`
- [x] `DATABASE_URL` agregado al job `database`  
- [x] Paso de validación de Prisma agregado
- [x] Scripts de validación local creados
- [x] `.env.example` actualizado con SQLite
- [x] Documentación de solución creada

---

## 🚀 Próximos Pasos

1. **Commit de cambios:**
   ```bash
   git add .github/workflows/ci.yml
   git add scripts/validate-ci.*
   git add .env.example
   git commit -m "fix(ci): Add DATABASE_URL environment variable to CI workflows"
   git push
   ```

2. **Verificar que el CI pase:**
   - Espera que GitHub Actions ejecute
   - Verifica que todos los checks pasen ✅

3. **Si falla nuevamente:**
   - Ejecuta `./scripts/validate-ci.ps1` localmente
   - Revisa los logs detallados en GitHub Actions
   - Verifica que todos los archivos estén commiteados

---

## 📚 Referencias

- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)
- [GitHub Actions Environment Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Última actualización**: 04 de Noviembre, 2024  
**Estado**: ✅ Corregido
