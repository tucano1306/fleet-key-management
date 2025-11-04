const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const dispatch = await prisma.user.findFirst({
    where: { role: 'DISPATCH' }
  })
  
  console.log('Usuario DISPATCH encontrado:')
  console.log(JSON.stringify(dispatch, null, 2))
  
  if (dispatch) {
    console.log('\n--- Verificando campo dispatchId ---')
    console.log('dispatchId:', dispatch.dispatchId)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
