# Sistema de Roles - Credenciales de Acceso

## 🔐 Usuarios de Prueba

### Administrador
- **Licencia**: `DL99999999`
- **PIN**: `1234`
- **Acceso a**: Dashboard completo con todas las funcionalidades (Admin, Llaves, Choferes, Reportes, Retiro Rápido)

### Choferes

#### Chofer 1
- **Licencia**: `DL12345678`
- **PIN**: `1234`
- **Acceso a**: Pantalla de Retiro Rápido solamente

#### Chofer 2
- **Licencia**: `DL87654321`
- **PIN**: `5678`
- **Acceso a**: Pantalla de Retiro Rápido solamente

#### Chofer 3
- **Licencia**: `DL11223344`
- **PIN**: `9012`
- **Acceso a**: Pantalla de Retiro Rápido solamente

---

## 🎯 Flujo de Autenticación por Rol

### Para Administradores
1. Login con licencia + PIN
2. Redirección automática a `/dashboard`
3. Navegación completa visible:
   - Inicio
   - Retiro Rápido
   - Admin
   - Llaves
   - Choferes

### Para Choferes
1. Login con licencia + PIN
2. Redirección automática a `/dashboard/quick-checkout`
3. Navegación simplificada:
   - Solo botón de "Retiro de Llaves"
   - Logout

---

## 🔄 Sistema de Roles Implementado

### Cambios en la Base de Datos
- **Campo nuevo**: `role` en tabla `users`
- **Valores posibles**: `'ADMIN'` o `'DRIVER'`
- **Default**: `'DRIVER'` (para nuevos registros)

### Cambios en el Código

#### 1. Schema Prisma (`prisma/schema.prisma`)
```prisma
model User {
  // ... otros campos
  role  String  @default("DRIVER") // ADMIN or DRIVER
}
```

#### 2. Autenticación (`lib/auth.ts`)
```typescript
export interface AuthUser {
  id: string
  employeeId: string
  fullName: string
  licenseNumber: string
  role: string // 'ADMIN' or 'DRIVER'
}
```

#### 3. Login (`app/(auth)/login/actions.ts`)
```typescript
// Redirige según el rol del usuario
if (user.role === 'ADMIN') {
  redirect('/dashboard')
} else {
  redirect('/dashboard/quick-checkout')
}
```

#### 4. Layout del Dashboard (`app/dashboard/layout.tsx`)
```typescript
const isAdmin = session.role === 'ADMIN'

// Muestra navegación completa solo si es admin
{isAdmin ? (
  // Todos los botones
) : (
  // Solo botón de retiro de llaves
)}
```

---

## 📋 Pantallas por Rol

### ADMIN (Dashboard Completo)
- ✅ Vista general con estadísticas
- ✅ Panel de administración
- ✅ Gestión de llaves
- ✅ Gestión de choferes
- ✅ Reportes e incidentes
- ✅ Retiro rápido de llaves
- ✅ Historial completo

### DRIVER (Solo Retiro Rápido)
- ✅ Pantalla simplificada de retiro
- ✅ Ingreso de número de llave
- ✅ Confirmación automática
- ✅ Registro instantáneo
- ❌ Sin acceso a admin
- ❌ Sin acceso a gestión
- ❌ Sin acceso a reportes

---

## 🚀 Comandos para Actualizar

Si hiciste cambios en el schema:

```powershell
# Aplicar migración
npx prisma migrate dev --name add_user_role

# Regenerar Prisma Client
npx prisma generate

# Actualizar datos de prueba
npm run db:seed
```

---

## 🔒 Seguridad

- Los roles se almacenan en la base de datos
- La sesión incluye el rol del usuario
- El servidor valida el rol en cada acción
- El layout renderiza según el rol (server-side)
- No se puede acceder a rutas de admin siendo chofer (el layout no muestra los enlaces)

---

## 🎨 Diferencias Visuales

### Header Admin
```
Gestión de Llaves
Panel de Administración
```

### Header Chofer
```
Gestión de Llaves
Panel de Chofer
```

### Botones Admin
```
[Inicio] [Retiro Rápido] [Admin] [Llaves] [Choferes] [Usuario] [Logout]
```

### Botones Chofer
```
[Retiro de Llaves] [Usuario] [Logout]
```

---

## 📝 Notas Importantes

1. **Nuevos registros**: Por defecto son DRIVER
2. **Cambiar rol**: Se debe hacer directamente en la base de datos o crear pantalla de admin
3. **Migración aplicada**: `20251104024420_add_user_role`
4. **Cache de Prisma**: Si ves errores de TypeScript, recarga VS Code (`Ctrl+Shift+P` → "Developer: Reload Window")
