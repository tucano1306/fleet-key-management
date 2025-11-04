# Key Management System - AI Assistant Instructions

## Project Overview
Full-stack Next.js 14 application for managing vehicle keys in a fleet management system. Drivers authenticate with PINs to check out/return keys with real-time transaction tracking.

## Architecture & Tech Stack
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS
- **Backend**: Next.js Server Actions (no separate API routes)
- **Database**: PostgreSQL with Prisma ORM v5.7
- **Auth**: Cookie-based sessions with bcrypt PIN hashing (10 rounds)
- **Styling**: Tailwind CSS with custom primary color palette
- **State Management**: React hooks with `useTransition` for optimistic updates

## Critical Workflow & Setup

### Initial Setup
```bash
npm install                    # Install dependencies
cp .env.example .env          # Configure DATABASE_URL
npm run db:migrate            # Create database schema
npm run db:generate           # Generate Prisma client
npm run db:seed               # Add demo data (EMP001/1234, EMP002/5678)
npm run dev                   # Start on localhost:3000
```

### Development Commands
- `npm run db:studio` - Visual database editor (Prisma Studio)
- `npm run db:migrate` - Create/apply migrations after schema changes
- `npm run db:seed` - Reset with test data (3 users, 5 keys)

## Project Structure Patterns

### Authentication Flow (Route Groups)
- `app/(auth)/layout.tsx` - Centered auth layout with gradient background
- `app/(auth)/login/page.tsx` - Client component with PIN input (4-6 digits)
- `app/(auth)/login/actions.ts` - Server action for `loginAction(employeeId, pin)`
- `lib/auth.ts` - Core auth: `createSession()`, `getSession()`, `verifyPin()`, `destroySession()`

**Pattern**: Server actions return `{ success: boolean, error?: string }` for consistent error handling.

### Dashboard Architecture (Protected Routes)
- `app/dashboard/layout.tsx` - Server component with session check + header/logout
- `app/dashboard/page.tsx` - Server component fetching keys + transactions with Prisma
- `app/dashboard/actions.ts` - Server actions: `checkoutKey(keyId)`, `checkinKey(transactionId)`
- Uses `revalidatePath('/dashboard')` after mutations for instant UI updates

**Pattern**: Pages are async server components; interactive parts use 'use client' directives.

### Component Architecture
**Server Components** (default):
- All page.tsx files
- Layouts with data fetching

**Client Components** (`'use client'` directive):
- `components/key-list.tsx` - Key grid with checkout buttons
- `components/my-transactions.tsx` - Active checkouts with return buttons
- All `/components/ui/*` components (Button, Input, Card, Badge)

**Data Flow**: Server components fetch → pass as props → client components handle interactions → server actions mutate → revalidate

## Database Schema Insights

### Three-Model Relationship
1. **User**: Drivers with `pinHash` (never expose!), `employeeId` as login identifier
2. **Key**: Vehicles with `status` enum (AVAILABLE | CHECKED_OUT | MAINTENANCE | LOST)
3. **KeyTransaction**: Join table tracking checkout/checkin with timestamps

**Critical Pattern**: Atomic updates using `prisma.$transaction([...])` to update both Key status and create KeyTransaction simultaneously.

### Query Patterns
```typescript
// Include pattern for checkout status
const keys = await prisma.key.findMany({
  include: {
    keyTransactions: {
      where: { status: 'CHECKED_OUT' },
      include: { user: { select: { fullName: true } } }
    }
  }
})
```

## Styling & Responsive Design

### Tailwind Configuration
- Custom `primary` color palette (50-900) in `tailwind.config.ts`
- Extra `xs` breakpoint at 475px
- Use `cn()` utility from `lib/utils.ts` for conditional class merging

### Responsive Breakpoints
- **Mobile** (<640px): Single column, full-width buttons (h-11+), stacked stats
- **Tablet** (640-1024px): 2-column grid for keys/transactions
- **Desktop** (>1024px): 3-column stats, 2-column key grid

**Pattern**: Grid classes like `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Component Variants
- **Button**: `variant` (primary|secondary|danger|ghost), `size` (sm|md|lg), `isLoading`
- **Badge**: `variant` (default|success|warning|danger|info)
- All use forwardRef for proper ref handling

## Security Patterns

1. **Never expose `pinHash`** - Use Prisma `select` to exclude it
2. **Session validation** - Every protected route checks `getSession()` → redirect if null
3. **Authorization checks** - Server actions verify user owns transaction before checkin
4. **HTTP-only cookies** - Session stored in cookie with `httpOnly: true, sameSite: 'lax'`

## Common Gotchas

1. **TypeScript Errors on Fresh Install**: Run `npm install` → `npm run db:generate` to fix Prisma client imports
2. **Session Expiry**: Default 8 hours (`SESSION_DURATION` in `lib/auth.ts`)
3. **Prisma Client Regeneration**: Required after any `schema.prisma` change
4. **Server Action Revalidation**: Always use `revalidatePath()` after mutations, not `router.refresh()`
5. **Date Handling**: Prisma returns Date objects, but client components need serialization (pass via props from server components)

## Extension Points

- Add key history view: Query `keyTransactions` with `checkinTime IS NOT NULL`
- Implement overdue alerts: Compare `checkoutTime` with threshold in server component
- Admin panel: Create `/app/admin` route group with user management
- Email notifications: Trigger from server actions after successful checkout
- Barcode scanning: Add camera input to login/checkout forms (client-side only)

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `NEXTAUTH_SECRET` - Session encryption key (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - App base URL for redirects (dev: http://localhost:3000)