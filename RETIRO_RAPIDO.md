# Guía de Uso - Retiro Rápido de Llaves

## Acceso a la Función

Hay dos formas de acceder al retiro rápido:

1. **Desde el Dashboard Principal**: Haz clic en el botón verde "Iniciar Retiro →"
2. **Desde el Menú de Navegación**: Haz clic en el botón "Retiro Rápido" (ícono de rayo verde)

## Flujo de Trabajo del Chofer

### Paso 1: Acceder al Sistema
- Inicia sesión con tu **número de licencia** y **PIN**
- Accede a `/dashboard/quick-checkout` o haz clic en "Retiro Rápido"

### Paso 2: Ingresar Número de Llave
- Escribe el número de la llave en el campo grande de texto
- El número se convertirá automáticamente a mayúsculas
- Ejemplo: `KEY-001`, `KEY-002`, etc.

### Paso 3: Verificación Automática
- **El sistema buscará automáticamente** la información del vehículo
- Si la llave existe y está disponible, verás:
  - ✅ Número de Unidad (en grande)
  - Placa del vehículo
  - Tipo de vehículo
  - Marca y modelo

### Paso 4: Confirmar Retiro
- **Opción 1**: Presiona la tecla **Enter** en tu teclado
- **Opción 2**: Haz clic en el botón "Confirmar Retiro"

### Paso 5: Confirmación
- Verás un mensaje verde: "✓ Llave [NÚMERO] retirada exitosamente"
- El campo se limpiará automáticamente
- Puedes retirar otra llave inmediatamente

## Registro Automático

Cuando confirmas el retiro, el sistema registra automáticamente:
- ✅ **Fecha y hora** del retiro
- ✅ **Chofer** que retiró la llave (tu información de sesión)
- ✅ **Llave y vehículo** asociado
- ✅ **Estado** actualizado a "CHECKED_OUT"

Este registro es visible inmediatamente en:
- Panel del administrador (`/dashboard/admin`)
- Dashboard principal del chofer
- Historial de transacciones

## Mensajes de Error

### "No se encontró ninguna llave con ese número"
- Verifica que el número de llave sea correcto
- Revisa si hay espacios adicionales

### "Esta llave no está disponible"
- La llave ya fue retirada por otro chofer
- La llave está en mantenimiento
- Contacta al administrador

## Ventajas del Retiro Rápido

- ⚡ **Velocidad**: Solo 3 segundos para completar el retiro
- 🎯 **Precisión**: Validación automática de disponibilidad
- 📱 **Simplificado**: Interfaz limpia y directa
- ⌨️ **Eficiente**: Usa Enter para confirmar rápidamente
- 🔄 **Auto-foco**: El cursor vuelve al campo automáticamente

## Devolución de Llaves

Para devolver una llave:
1. Ve al **Dashboard** principal
2. En "Mis Llaves Retiradas" verás tus llaves activas
3. Haz clic en **"Devolver"**
4. Selecciona el **estado del vehículo**
5. Si hubo incidentes, describe lo ocurrido
6. Confirma la devolución

## Soporte Técnico

Si tienes problemas:
- Verifica tu conexión a internet
- Asegúrate de estar correctamente autenticado
- Contacta al administrador del sistema
- Refresca la página (F5)
