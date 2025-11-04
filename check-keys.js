const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('=== USUARIOS ===')
  const users = await prisma.user.findMany()
  users.forEach(u => {
    console.log(`- ${u.fullName} (${u.role})`)
    console.log(`  employeeId: ${u.employeeId}`)
    console.log(`  licenseNumber: ${u.licenseNumber}`)
    console.log(`  dispatchId: ${u.dispatchId}`)
    console.log(`  PIN: (hasheado)`)
    console.log('')
  })

  console.log('\n=== VEHÍCULOS ===')
  const vehicles = await prisma.vehicle.findMany()
  vehicles.forEach(v => {
    console.log(`- ${v.unitNumber} - ${v.make} ${v.model} (${v.licensePlate})`)
  })

  console.log('\n=== LLAVES ===')
  const keys = await prisma.key.findMany({
    include: {
      vehicle: true
    }
  })
  keys.forEach(k => {
    console.log(`- Llave: ${k.keyNumber}`)
    console.log(`  ID: ${k.id}`)
    console.log(`  Vehículo: ${k.vehicle.unitNumber} - ${k.vehicle.make} ${k.vehicle.model}`)
    console.log(`  Estado: ${k.status}`)
    console.log(`  Ubicación: ${k.location}`)
    console.log('')
  })

  console.log('\n=== TRANSACCIONES ACTIVAS ===')
  const transactions = await prisma.keyTransaction.findMany({
    where: { status: 'CHECKED_OUT' },
    include: {
      key: { include: { vehicle: true } },
      user: true
    }
  })
  
  if (transactions.length === 0) {
    console.log('No hay transacciones activas')
  } else {
    transactions.forEach(t => {
      console.log(`- Usuario: ${t.user.fullName}`)
      console.log(`  Llave: ${t.key.keyNumber}`)
      console.log(`  Vehículo: ${t.key.vehicle.unitNumber}`)
      console.log(`  Checkout: ${t.checkoutTime}`)
      console.log('')
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
