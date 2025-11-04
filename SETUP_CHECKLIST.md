# ✅ Lista de Verificación de Configuración

Use esta lista para asegurarse de que todo esté configurado correctamente.

## Pre-requisitos

- [ ] Node.js 18.x o superior instalado
  ```bash
  node --version  # Debe mostrar v18.x o superior
  ```

- [ ] PostgreSQL instalado y corriendo
  ```bash
  psql --version  # Debe mostrar versión 14 o superior
  ```

- [ ] Git instalado (opcional, para control de versiones)
  ```bash
  git --version
  ```

## Instalación del Proyecto

- [ ] Dependencias instaladas
  ```bash
  npm install
  ```
  **Resultado esperado**: "added 400 packages" sin errores críticos

- [ ] Variables de entorno configuradas
  ```bash
  # 1. Copiar archivo de ejemplo
  cp .env.example .env
  
  # 2. Editar .env y configurar DATABASE_URL
  # Formato: postgresql://usuario:contraseña@localhost:5432/key_management
  ```

## Base de Datos

- [ ] Base de datos creada
  ```bash
  psql -U postgres
  # En psql: CREATE DATABASE key_management;
  # Luego: \q para salir
  ```

- [ ] Cliente Prisma generado
  ```bash
  npm run db:generate
  ```
  **Resultado esperado**: "✔ Generated Prisma Client"

- [ ] Migraciones aplicadas
  ```bash
  npm run db:migrate
  ```
  **Resultado esperado**: "Your database is now in sync with your schema"

- [ ] Datos de prueba cargados
  ```bash
  npm run db:seed
  ```
  **Resultado esperado**: 
  ```
  ✅ Created user: Juan Pérez (PIN: 1234)
  ✅ Created user: María González (PIN: 5678)
  ✅ Created user: Carlos Rodríguez (PIN: 9012)
  🔑 Created key: K001 - Toyota Camry 2023 - ABC-123
  ... (5 llaves en total)
  ✨ Seed completed!
  ```

## Verificación de Funcionamiento

- [ ] Servidor de desarrollo inicia sin errores
  ```bash
  npm run dev
  ```
  **Resultado esperado**: 
  ```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Ready in XXXms
  ```

- [ ] Página de login accesible
  - Abrir http://localhost:3000
  - Debe redirigir a http://localhost:3000/login
  - Formulario visible con campos "ID de Empleado" y "PIN"

- [ ] Login funcional
  - Ingresar: EMP001 / 1234
  - Click en "Iniciar Sesión"
  - Debe redirigir a /dashboard

- [ ] Dashboard carga correctamente
  - Ver 3 tarjetas de estadísticas (Total, Disponibles, En Uso)
  - Ver sección "Todas las Llaves" con 5 llaves
  - Botón "Retirar Llave" visible en llaves disponibles

- [ ] Checkout de llave funciona
  - Click en "Retirar Llave" en cualquier llave disponible
  - Llave debe aparecer en sección "Mis Llaves Retiradas"
  - Estado de la llave cambia a "En Uso"

- [ ] Checkin de llave funciona
  - Click en "Devolver Llave" en sección "Mis Llaves Retiradas"
  - Llave desaparece de "Mis Llaves Retiradas"
  - Llave vuelve a estado "Disponible"

- [ ] Logout funciona
  - Click en "Cerrar Sesión" en el header
  - Debe redirigir a /login
  - Intento de acceder a /dashboard debe redirigir a /login

## Verificación Responsive

- [ ] Vista Mobile (< 640px)
  - Abrir DevTools (F12)
  - Toggle Device Toolbar
  - Seleccionar iPhone
  - Verificar que las tarjetas se apilan en 1 columna
  - Botones tienen tamaño adecuado para touch
  - Header se adapta correctamente

- [ ] Vista Tablet (640-1024px)
  - Seleccionar iPad en DevTools
  - Verificar grid de 2 columnas
  - Navegación apropiada

- [ ] Vista Desktop (> 1024px)
  - Vista normal del navegador
  - Verificar 3 columnas en estadísticas
  - Layout completo visible

## Base de Datos Visual (Opcional)

- [ ] Prisma Studio funciona
  ```bash
  npm run db:studio
  ```
  - Debe abrir http://localhost:5555
  - Ver tablas: User, Key, KeyTransaction
  - Poder ver y editar datos visualmente

## Herramientas de Desarrollo (Opcional)

- [ ] TypeScript compile sin errores críticos
  ```bash
  npm run build
  ```
  **Nota**: Puede haber warnings, pero no debe fallar

- [ ] ESLint funciona
  ```bash
  npm run lint
  ```

## Solución de Problemas Comunes

### ❌ "Cannot find module '@prisma/client'"
**Solución**:
```bash
npm run db:generate
```

### ❌ "Connection refused" o "ECONNREFUSED"
**Solución**:
1. Verificar que PostgreSQL esté corriendo
2. Verificar DATABASE_URL en .env
3. Intentar conectar manualmente: `psql -U postgres`

### ❌ "Migration failed" o "Database does not exist"
**Solución**:
```bash
# Crear base de datos manualmente
psql -U postgres
CREATE DATABASE key_management;
\q

# Volver a intentar
npm run db:migrate
```

### ❌ Página en blanco o error 500
**Solución**:
1. Revisar consola del navegador (F12)
2. Revisar terminal donde corre `npm run dev`
3. Asegurar que Prisma Client esté generado: `npm run db:generate`

### ❌ "Session expired" o redirect loop
**Solución**:
```bash
# Borrar cookies del navegador
# En Chrome: F12 > Application > Cookies > localhost > Borrar key_mgmt_session
```

## 🎉 Configuración Completa

Si todos los ítems están marcados, ¡el proyecto está listo para usar!

### Siguientes Pasos Sugeridos:

1. **Explorar el código**: Revisar `app/dashboard/page.tsx` para entender el flujo
2. **Leer documentación**: `README.md` para detalles completos
3. **Revisar arquitectura**: `.github/copilot-instructions.md` para patrones
4. **Experimentar**: Crear nuevos usuarios/llaves usando Prisma Studio
5. **Personalizar**: Modificar colores en `tailwind.config.ts`

### Recursos Útiles:

- **Documentación Next.js**: https://nextjs.org/docs
- **Documentación Prisma**: https://www.prisma.io/docs
- **Documentación Tailwind**: https://tailwindcss.com/docs
- **Guía TypeScript**: https://www.typescriptlang.org/docs

---

**¿Problemas?** Revisa `QUICKSTART.md` o los logs en la terminal.
