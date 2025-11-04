# 🏗️ Arquitectura del Sistema

## Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                            │
│  ┌────────────────┐              ┌────────────────┐        │
│  │  Login Page    │─────────────▶│  Dashboard     │        │
│  │  (Cliente)     │   Session    │  (Cliente)     │        │
│  └────────────────┘   Cookie     └────────────────┘        │
│         │                                  │                │
│         │ Server Actions                   │ Server Actions │
│         ▼                                  ▼                │
└─────────────────────────────────────────────────────────────┘
          │                                  │
          │                                  │
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                           │
│  ┌────────────────┐              ┌────────────────┐        │
│  │ loginAction()  │              │ checkoutKey()  │        │
│  │ (Server)       │              │ checkinKey()   │        │
│  └────────────────┘              └────────────────┘        │
│         │                                  │                │
│         ▼                                  ▼                │
│  ┌────────────────────────────────────────────────┐        │
│  │          lib/auth.ts                           │        │
│  │  ├─ createSession()                            │        │
│  │  ├─ getSession()                               │        │
│  │  ├─ verifyPin()                                │        │
│  │  └─ destroySession()                           │        │
│  └────────────────────────────────────────────────┘        │
│                       │                                     │
│                       ▼                                     │
│  ┌────────────────────────────────────────────────┐        │
│  │          lib/prisma.ts                         │        │
│  │          (Prisma Client)                       │        │
│  └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                       │
│  ┌────────────┐   ┌────────────┐   ┌────────────────┐     │
│  │   users    │   │    keys    │   │ key_transactions│     │
│  ├────────────┤   ├────────────┤   ├────────────────┤     │
│  │ id         │   │ id         │   │ id             │     │
│  │ employeeId │   │ keyNumber  │   │ keyId          │     │
│  │ fullName   │   │ vehicleInfo│   │ userId         │     │
│  │ pinHash    │   │ location   │   │ checkoutTime   │     │
│  │ ...        │   │ status     │   │ checkinTime    │     │
│  └────────────┘   │ ...        │   │ status         │     │
│                   └────────────┘   └────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Autenticación

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. Ingresa empleadoId + PIN
       ▼
┌─────────────────────┐
│  /login (Cliente)   │
└──────┬──────────────┘
       │
       │ 2. Llama loginAction(employeeId, pin)
       ▼
┌──────────────────────┐
│ loginAction (Server) │◀─────┐
└──────┬───────────────┘      │
       │                      │
       │ 3. verifyPin()       │ 5. Return { success: false }
       ▼                      │    si falla
┌─────────────────┐           │
│ lib/auth.ts     │           │
│ ├─ Busca user   │───────────┘
│ ├─ bcrypt.compare()
│ └─ createSession()
└──────┬──────────┘
       │
       │ 4. Set cookie HTTP-only
       │    { userId, expiresAt }
       ▼
┌─────────────────┐
│  Redirect →     │
│  /dashboard     │
└─────────────────┘
```

## Flujo de Checkout de Llave

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. Click "Retirar Llave"
       ▼
┌──────────────────────┐
│  KeyList (Cliente)   │
│  ├─ useTransition    │
│  └─ handleCheckout() │
└──────┬───────────────┘
       │
       │ 2. Llama checkoutKey(keyId)
       ▼
┌──────────────────────┐
│ checkoutKey (Server) │
└──────┬───────────────┘
       │
       │ 3. Validaciones
       ├─ getSession() ────▶ Usuario autenticado?
       ├─ findKey()    ────▶ Llave existe?
       └─ status check ────▶ Llave disponible?
       │
       │ 4. Transaction atómica
       ▼
┌──────────────────────────────┐
│   prisma.$transaction([     │
│     1. Create transaction    │
│     2. Update key status     │
│   ])                         │
└──────┬───────────────────────┘
       │
       │ 5. revalidatePath('/dashboard')
       ▼
┌────────────────────┐
│  UI actualizada    │
│  ├─ Key en "En Uso"│
│  └─ Aparece en     │
│     "Mis Llaves"   │
└────────────────────┘
```

## Estructura de Carpetas Detallada

```
app-key/
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Route group (no afecta URL)
│   │   ├── layout.tsx               # Layout centrado con gradiente
│   │   └── login/
│   │       ├── page.tsx             # Componente cliente
│   │       └── actions.ts           # Server actions
│   │
│   ├── dashboard/                    # Ruta protegida
│   │   ├── layout.tsx               # Header + auth check
│   │   ├── page.tsx                 # Server component (fetch data)
│   │   └── actions.ts               # checkoutKey, checkinKey
│   │
│   ├── layout.tsx                    # Root layout (fuentes, metadata)
│   ├── page.tsx                      # Redirect a login/dashboard
│   └── globals.css                   # Tailwind + custom CSS
│
├── components/
│   ├── ui/                          # Componentes base reutilizables
│   │   ├── button.tsx               # variants, sizes, isLoading
│   │   ├── input.tsx                # label, error handling
│   │   ├── card.tsx                 # Card, CardHeader, CardTitle, CardContent
│   │   └── badge.tsx                # 5 variantes de color
│   │
│   ├── key-list.tsx                 # Lista de llaves (Cliente)
│   └── my-transactions.tsx          # Transacciones activas (Cliente)
│
├── lib/
│   ├── auth.ts                      # Sesiones + verificación PIN
│   ├── prisma.ts                    # Singleton Prisma Client
│   └── utils.ts                     # cn(), formatDate(), etc.
│
├── prisma/
│   ├── schema.prisma                # Definición de modelos
│   └── seed.ts                      # Datos de prueba
│
├── .github/
│   └── copilot-instructions.md      # Guía para AI agents
│
├── middleware.ts                     # Protección de rutas
├── next.config.js                    # Config Next.js
├── tailwind.config.ts               # Custom colors + breakpoints
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies + scripts
│
└── Documentación/
    ├── README.md                    # Guía completa
    ├── QUICKSTART.md                # Inicio rápido
    ├── PROJECT_SUMMARY.md           # Resumen del proyecto
    ├── SETUP_CHECKLIST.md           # Lista de verificación
    └── ARCHITECTURE.md              # Este archivo
```

## Patrones de Componentes

### Server Component Pattern
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await getSession()      // Server-side auth
  const keys = await prisma.key.findMany() // Direct DB access
  
  return <KeyList keys={keys} />          // Pass data as props
}
```

### Client Component Pattern
```typescript
// components/key-list.tsx
'use client'

export function KeyList({ keys }) {
  const [isPending, startTransition] = useTransition()
  
  const handleClick = () => {
    startTransition(async () => {
      await checkoutKey(keyId)  // Call server action
    })
  }
  
  return <Button onClick={handleClick} isLoading={isPending} />
}
```

### Server Action Pattern
```typescript
// app/dashboard/actions.ts
'use server'

export async function checkoutKey(keyId: string) {
  const session = await getSession()
  // ... validaciones
  
  await prisma.$transaction([...])
  revalidatePath('/dashboard')
  
  return { success: true }  // Consistent return shape
}
```

## Flujo de Datos

```
Server Component
      │
      │ 1. Fetch data (async/await)
      ├─ await getSession()
      ├─ await prisma.key.findMany()
      └─ await prisma.keyTransaction.findMany()
      │
      │ 2. Pass data via props
      ▼
Client Component
      │
      │ 3. User interaction
      ├─ onClick
      ├─ onChange
      └─ onSubmit
      │
      │ 4. Call server action
      ▼
Server Action
      │
      │ 5. Validate + mutate
      ├─ Auth check
      ├─ Business logic
      └─ Database update
      │
      │ 6. Revalidate path
      ▼
UI Updates Automatically
```

## Seguridad en Capas

```
┌─────────────────────────────────────┐
│  1. Middleware (Route Protection)   │
│     ├─ Check session cookie         │
│     └─ Redirect if unauthorized     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  2. Server Component (Auth Check)   │
│     ├─ getSession()                 │
│     └─ Redirect if null             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  3. Server Action (Authorization)   │
│     ├─ Verify user owns resource    │
│     └─ Return error if unauthorized │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  4. Database (Schema Validation)    │
│     ├─ Foreign key constraints      │
│     ├─ Unique constraints           │
│     └─ Enum validations             │
└─────────────────────────────────────┘
```

## Estados de Llave

```
┌──────────────┐
│  AVAILABLE   │◀────────┐
└──────┬───────┘         │
       │                 │
       │ checkoutKey()   │ checkinKey()
       ▼                 │
┌──────────────┐         │
│ CHECKED_OUT  │─────────┘
└──────┬───────┘
       │
       │ (manual update)
       ▼
┌──────────────┐
│ MAINTENANCE  │
└──────────────┘
       │
       │ (manual update)
       ▼
┌──────────────┐
│    LOST      │
└──────────────┘
```

## Ciclo de Vida de una Sesión

```
Login
  │
  ├─ PIN verificado ✓
  │
  ▼
createSession()
  │
  ├─ sessionData = { userId, expiresAt }
  ├─ cookie.set('key_mgmt_session', sessionData)
  └─ maxAge: 8 hours
  │
  ▼
Usuario autenticado
  │
  ├─ Cada request: getSession() valida cookie
  ├─ Si expiró → destroySession()
  └─ Si válido → return user data
  │
  ▼
Logout
  │
  └─ destroySession() → cookie.delete()
```

## Responsive Breakpoints

```
Mobile          Tablet         Desktop
< 640px         640-1024px     > 1024px
│               │              │
├─ 1 columna    ├─ 2 columnas  ├─ 3 columnas (stats)
├─ Stack        ├─ Grid 2x2    ├─ Grid 3x1
├─ h-11 buttons ├─ h-11 btn    ├─ h-11 btn
└─ Full width   └─ Flex wrap   └─ Max-width
```

---

**Este documento describe la arquitectura completa del Sistema de Gestión de Llaves**

Para más detalles:
- Implementación: Ver código en `app/` y `components/`
- Configuración: Ver `README.md`
- Desarrollo: Ver `.github/copilot-instructions.md`
