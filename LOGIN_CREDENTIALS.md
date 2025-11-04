# Sistema de Login - Credenciales de Prueba

## 🔐 Cambios Importantes

**AHORA LOS CHOFERES Y PERSONAL DE LIMPIEZA USAN SOLO LOS ÚLTIMOS 4 DÍGITOS DE SU LICENCIA**

En lugar de ingresar el número completo de licencia (por ejemplo, `DL12345678`), ahora solo se requieren los últimos 4 dígitos (por ejemplo, `5678`).

---

## 👥 Credenciales de Acceso

### DISPATCH (Administrador - Solo Vista)
- **ID**: `0000`
- **PIN**: `0000`
- **Acceso**: Dashboard administrativo con vista de todas las llaves y transacciones
- **Restricciones**: No puede retirar ni devolver llaves, solo visualizar información

---

### CHOFERES Y PERSONAL

#### Chofer - Juan Pérez
- **Últimos 4 Dígitos de Licencia**: `5678` *(de DL12345678)*
- **PIN**: `1234`
- **Tipo**: CHOFER
- **Acceso**: Retiro rápido de llaves

#### Chofer - María González
- **Últimos 4 Dígitos de Licencia**: `4321` *(de DL87654321)*
- **PIN**: `5678`
- **Tipo**: CHOFER
- **Acceso**: Retiro rápido de llaves

#### Personal de Limpieza - Carlos Rodríguez
- **Últimos 4 Dígitos de Licencia**: `3344` *(de DL11223344)*
- **PIN**: `9012`
- **Tipo**: PERSONAL DE LIMPIEZA
- **Acceso**: Retiro rápido de llaves

---

## 📝 Cómo Usar el Sistema

### Para DISPATCH:
1. Seleccionar "Dispatch" en el tipo de usuario
2. Ingresar ID: `0000`
3. Ingresar PIN: `0000`
4. Accederá al dashboard administrativo con vista completa

### Para Choferes y Personal de Limpieza:
1. Seleccionar "Chofer / Staff" en el tipo de usuario
2. Ingresar los **últimos 4 dígitos** de su licencia (ejemplo: `5678`)
3. Ingresar su PIN personal
4. Accederá al sistema de retiro rápido de llaves

---

## ✅ Características de Seguridad

- **Auto-logout**: El sistema cierra sesión automáticamente después de retirar o devolver una llave (2 segundos)
- **Auto-return**: Si una llave ya fue retirada por el mismo conductor, automáticamente se mostrará la opción de devolverla
- **Validación de 4 dígitos**: El sistema solo acepta exactamente 4 números para los choferes/personal
- **PIN cifrado**: Todos los PINs se almacenan con hash bcrypt (no se pueden recuperar)

---

## 🔄 Registro de Nuevos Usuarios

Cuando un nuevo chofer o personal de limpieza se registra:

1. Ir a la página de registro
2. Ingresar nombre completo
3. Seleccionar tipo (Chofer o Personal de Limpieza)
4. **Ingresar solo los últimos 4 dígitos de su licencia** (ejemplo: `1234`)
5. Crear un PIN de 4-6 dígitos
6. Confirmar el PIN

El sistema generará automáticamente un ID de empleado único basado en los últimos 4 dígitos + timestamp.

---

## 🚀 Ventajas del Nuevo Sistema

✅ **Más rápido**: Solo 4 dígitos en lugar de un número completo  
✅ **Más fácil**: Menos errores al escribir  
✅ **Móvil-friendly**: Teclado numérico en dispositivos móviles  
✅ **Seguro**: Mantiene la unicidad de las licencias  
✅ **Conveniente**: Ideal para retiros rápidos en campo

---

## 🗃️ Llaves de Prueba Disponibles

- **K001**: Toyota Camry (ABC-123) - UNIT-001
- **K002**: Ford F-150 (DEF-456) - UNIT-002
- **K003**: Honda Civic (GHI-789) - UNIT-003
- **K004**: Chevrolet Express (JKL-012) - UNIT-004
- **K005**: Nissan Sentra (MNO-345) - UNIT-005

Todas las llaves están disponibles para retiro en el estado inicial de la base de datos.
