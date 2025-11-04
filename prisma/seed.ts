import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo users
  const users = [
    {
      employeeId: 'DISPATCH001',
      fullName: 'Dispatch Central',
      dispatchId: '0000',
      licenseLast4: null,
      pin: '0000',
      role: 'DISPATCH',
    },
    {
      employeeId: 'DRV001',
      fullName: 'Juan Pérez',
      licenseLast4: '5678', // Últimos 4 dígitos de DL12345678
      dispatchId: null,
      pin: '1234',
      role: 'DRIVER',
    },
    {
      employeeId: 'DRV002',
      fullName: 'María González',
      licenseLast4: '4321', // Últimos 4 dígitos de DL87654321
      dispatchId: null,
      pin: '5678',
      role: 'DRIVER',
    },
    {
      employeeId: 'CLN001',
      fullName: 'Carlos Rodríguez',
      licenseLast4: '3344', // Últimos 4 dígitos de DL11223344
      dispatchId: null,
      pin: '9012',
      role: 'CLEANING_STAFF',
    },
  ]

  for (const userData of users) {
    const pinHash = await bcrypt.hash(userData.pin, 10)
    
    await prisma.user.upsert({
      where: { employeeId: userData.employeeId },
      update: {},
      create: {
        employeeId: userData.employeeId,
        fullName: userData.fullName,
        ...(userData.licenseLast4 && { licenseLast4: userData.licenseLast4 }),
        ...(userData.dispatchId && { dispatchId: userData.dispatchId }),
        pinHash,
        role: userData.role,
      },
    })
    console.log(`✅ Created user: ${userData.fullName} (${userData.role}) (PIN: ${userData.pin})`)
  }

  // Create demo vehicles
  const vehicles = [
    {
      plateNumber: 'ABC-123',
      vehicleType: 'Sedan',
      unitNumber: 'UNIT-001',
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      color: 'Gris',
      notes: 'Vehículo de servicio regular',
    },
    {
      plateNumber: 'DEF-456',
      vehicleType: 'Pickup',
      unitNumber: 'UNIT-002',
      brand: 'Ford',
      model: 'F-150',
      year: 2022,
      color: 'Azul',
      notes: 'Camioneta para cargas pesadas',
    },
    {
      plateNumber: 'GHI-789',
      vehicleType: 'Sedan',
      unitNumber: 'UNIT-003',
      brand: 'Honda',
      model: 'Civic',
      year: 2024,
      color: 'Rojo',
      notes: 'Vehículo compacto para rutas urbanas',
    },
    {
      plateNumber: 'JKL-012',
      vehicleType: 'Van',
      unitNumber: 'UNIT-004',
      brand: 'Chevrolet',
      model: 'Express',
      year: 2023,
      color: 'Blanco',
      notes: 'Van para transporte de grupo',
    },
    {
      plateNumber: 'MNO-345',
      vehicleType: 'Sedan',
      unitNumber: 'UNIT-005',
      brand: 'Nissan',
      model: 'Sentra',
      year: 2023,
      color: 'Negro',
      notes: 'Sedán económico',
    },
  ]

  const createdVehicles: any[] = []
  for (const vehicleData of vehicles) {
    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: vehicleData.plateNumber },
      update: {},
      create: vehicleData,
    })
    createdVehicles.push(vehicle)
    console.log(`🚗 Created vehicle: ${vehicleData.unitNumber} - ${vehicleData.brand} ${vehicleData.model} (${vehicleData.plateNumber})`)
  }

  // Create demo keys linked to vehicles
  const keys = [
    {
      keyNumber: 'K001',
      vehicleId: createdVehicles[0].id,
      location: 'Hook A1',
      notes: 'Llave principal',
    },
    {
      keyNumber: 'K002',
      vehicleId: createdVehicles[1].id,
      location: 'Hook A2',
      notes: 'Llave principal',
    },
    {
      keyNumber: 'K003',
      vehicleId: createdVehicles[2].id,
      location: 'Hook B1',
      notes: 'Llave principal',
    },
    {
      keyNumber: 'K004',
      vehicleId: createdVehicles[3].id,
      location: 'Hook B2',
      notes: 'Llave principal',
    },
    {
      keyNumber: 'K005',
      vehicleId: createdVehicles[4].id,
      location: 'Hook C1',
      notes: 'Llave principal',
    },
  ]

  for (const keyData of keys) {
    await prisma.key.upsert({
      where: { keyNumber: keyData.keyNumber },
      update: {},
      create: keyData,
    })
    console.log(`🔑 Created key: ${keyData.keyNumber}`)
  }

  console.log('✨ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
