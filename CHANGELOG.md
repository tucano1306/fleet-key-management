# Changelog - License Authentication Update

## [v1.1.0] - 2024-11-04

### 🎯 Major Changes: Simplified Driver Authentication

#### Changed
- **Authentication Method**: Drivers and cleaning staff now authenticate using **only the last 4 digits** of their license number instead of the full license number
- **Database Schema**: Renamed `licenseNumber` field to `licenseLast4` across all tables
- **UI Labels**: Updated all login and registration forms to reflect "Últimos 4 Dígitos de Licencia"
- **Validation**: Added strict 4-digit numeric validation for driver/staff authentication

#### Technical Details

##### Database Migration
- Migration: `20251104143643_change_license_to_last4`
- Changed column: `license_number` → `license_last4`
- Updated all existing user records (4 users affected)

##### Files Modified
1. **prisma/schema.prisma**
   - Field renamed: `licenseLast4 String? @unique @map("license_last4")`
   - Added comment: "Últimos 4 dígitos de licencia - DRIVER/CLEANING_STAFF"

2. **prisma/seed.ts**
   - Updated test users:
     - Juan Pérez: `5678` (from DL12345678)
     - María González: `4321` (from DL87654321)
     - Carlos Rodríguez: `3344` (from DL11223344)

3. **lib/auth.ts**
   - Updated `AuthUser` interface: `licenseLast4: string | null`
   - Updated `verifyDriver()` function signature: accepts `licenseLast4` parameter
   - All Prisma queries updated to use new field name

4. **app/(auth)/register/actions.ts**
   - Updated `RegisterData` interface
   - Added validation: exactly 4 numeric digits required
   - Updated employeeId generation: `DRV${licenseLast4}${timestamp}`
   - Updated unique constraint check

5. **app/(auth)/register/page.tsx**
   - Label: "Últimos 4 Dígitos de Licencia"
   - Placeholder: "1234"
   - Added: `maxLength={4}`, `pattern="[0-9]{4}"`, `inputMode="numeric"`
   - Client-side validation for 4 digits

6. **app/(auth)/login/page.tsx**
   - Label: "Últimos 4 Dígitos de Licencia" (for DRIVER type)
   - Placeholder: "1234"
   - Added: `maxLength={4}`, `pattern="[0-9]{4}"`, `inputMode="numeric"`
   - Added validation: 4-digit format check for drivers

#### Benefits
✅ **Faster login**: Reduced typing from ~10 characters to 4  
✅ **Mobile-friendly**: Numeric keyboard on mobile devices  
✅ **Reduced errors**: Simpler input = fewer typos  
✅ **Better UX**: Optimized for frequent login/logout cycle in field operations  
✅ **Maintained security**: Unique constraint ensures no duplicate last-4-digits  

#### Breaking Changes
⚠️ **Login credentials changed**: All drivers must now use last 4 digits of license  
⚠️ **Database migration required**: Existing deployments must run migration  
⚠️ **API changes**: `verifyDriver()` function signature changed  

#### Migration Path for Existing Users
Existing users were automatically migrated:
- Full license numbers were truncated to last 4 digits
- Database migration handled extraction automatically
- No user action required for existing accounts

---

## Test Credentials (Updated)

### DISPATCH
- ID: `0000`
- PIN: `0000`

### Drivers/Staff (Last 4 Digits)
- Juan Pérez: `5678` + PIN `1234`
- María González: `4321` + PIN `5678`
- Carlos Rodríguez: `3344` + PIN `9012`

---

## Previous Versions

### [v1.0.0] - 2024-11-04
- Initial release with full license number authentication
- Tri-role system (DISPATCH/DRIVER/CLEANING_STAFF)
- Quick checkout feature with auto-return detection
- Auto-logout security feature
- Dashboard with real-time key tracking
