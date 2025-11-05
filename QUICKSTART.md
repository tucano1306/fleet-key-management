# Guía de Inicio Rápido

## 🚀 Deploy desde Terminal con Vercel CLI

### Instalación Rápida

```powershell
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy a preview (testing)
vercel

# 4. Deploy a producción
vercel --prod
```

**Ver comandos completos**: [COMANDOS_VERCEL.md](./COMANDOS_VERCEL.md)

---

## 🚀 Configuración Local Inicial (5 minutos)

### 1. Instalar PostgreSQL

**Windows (PowerShell como Administrador):**
```powershell
# Opción 1: Con winget
winget install PostgreSQL.PostgreSQL

# Opción 2: Descargar instalador
# Visitar https://www.postgresql.org/download/windows/
```

**Verificar instalación:**
```powershell
psql --version
```

### 2. Crear Base de Datos

```powershell
# Conectar a PostgreSQL
psql -U postgres

# En el prompt de PostgreSQL:
CREATE DATABASE key_management;
\q
```

### 3. Configurar Proyecto

```bash
# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
```

Editar `.env`:
```env
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/key_management?schema=public"
```

### 4. Inicializar Base de Datos

```bash
# Crear tablas
npm run db:migrate

# Generar cliente Prisma
npm run db:generate

# Agregar datos de prueba
npm run db:seed
```

### 5. Iniciar Aplicación

```bash
npm run dev
```

Abrir: http://localhost:3000

## 👤 Usuarios de Prueba

| Empleado | PIN  | Nombre           |
|----------|------|------------------|
| EMP001   | 1234 | Juan Pérez       |
| EMP002   | 5678 | María González   |
| EMP003   | 9012 | Carlos Rodríguez |

## 🔑 Llaves de Prueba

- **K001**: Toyota Camry 2023 - ABC-123
- **K002**: Ford F-150 2022 - DEF-456
- **K003**: Honda Civic 2024 - GHI-789
- **K004**: Chevrolet Express 2023 - JKL-012
- **K005**: Nissan Sentra 2023 - MNO-345

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                # Iniciar servidor (puerto 3000)
npm run db:studio          # Abrir editor de BD visual

# Base de datos
npm run db:migrate         # Crear/aplicar migraciones
npm run db:generate        # Regenerar cliente Prisma
npm run db:seed            # Resetear datos de prueba

# Producción
npm run build              # Compilar aplicación
npm start                  # Iniciar en producción
```

## 📱 Probar Responsive

1. **Desktop**: Navegador normal
2. **Tablet**: F12 → Toggle Device Toolbar → iPad
3. **Mobile**: F12 → Toggle Device Toolbar → iPhone

## ⚠️ Solución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
npm run db:generate
```

### Error: "Connection refused" (PostgreSQL)
```bash
# Verificar que PostgreSQL esté corriendo
# Windows Services: buscar "postgresql" y asegurar que esté "Running"
```

### Error: "Migration failed"
```bash
# Borrar y recrear base de datos
psql -U postgres
DROP DATABASE key_management;
CREATE DATABASE key_management;
\q

npm run db:migrate
npm run db:seed
```

## 📚 Siguientes Pasos

1. Explorar el dashboard
2. Retirar una llave (botón "Retirar Llave")
3. Ver tus llaves activas (sección superior)
4. Devolver una llave (botón "Devolver Llave")
5. Cerrar sesión y probar con otro usuario
6. Revisar `README.md` para documentación completa

## 🎨 Personalización Rápida

### Cambiar Colores Primarios
Editar `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    500: '#tu-color-principal',
    600: '#tu-color-hover',
    // ...
  }
}
```

### Agregar Más Usuarios
Editar `prisma/seed.ts` y ejecutar:
```bash
npm run db:seed
```

### Cambiar Duración de Sesión
Editar `lib/auth.ts`:
```typescript
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 horas
```

---

**¿Problemas?** Revisa los logs en la terminal o abre un issue.
