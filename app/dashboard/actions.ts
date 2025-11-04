'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

interface ReturnData {
  vehicleCondition: string
  incidentReport?: string
}

export async function checkoutKey(keyId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'No autorizado' }
    }

    // Check if key exists and is available
    const key = await prisma.key.findUnique({
      where: { id: keyId },
      include: {
        keyTransactions: {
          where: { status: 'CHECKED_OUT' }
        }
      }
    })

    if (!key) {
      return { success: false, error: 'Llave no encontrada' }
    }

    if (key.status !== 'AVAILABLE') {
      return { success: false, error: 'La llave no está disponible' }
    }

    if (key.keyTransactions.length > 0) {
      return { success: false, error: 'La llave ya está en uso' }
    }

    // Create transaction and update key status
    await prisma.$transaction([
      prisma.keyTransaction.create({
        data: {
          keyId: key.id,
          userId: session.id,
          status: 'CHECKED_OUT'
        }
      }),
      prisma.key.update({
        where: { id: key.id },
        data: { status: 'CHECKED_OUT' }
      })
    ])

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Checkout error:', error)
    return { success: false, error: 'Error al retirar la llave' }
  }
}

export async function checkinKey(transactionId: string, returnData: ReturnData) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'No autorizado' }
    }

    // Validar condición del vehículo
    const validConditions = ['GOOD', 'MINOR_DAMAGE', 'MAJOR_DAMAGE', 'ACCIDENT']
    if (!validConditions.includes(returnData.vehicleCondition)) {
      return { success: false, error: 'Condición del vehículo no válida' }
    }

    // Get transaction
    const transaction = await prisma.keyTransaction.findUnique({
      where: { id: transactionId },
      include: { key: true }
    })

    if (!transaction) {
      return { success: false, error: 'Transacción no encontrada' }
    }

    if (transaction.userId !== session.id) {
      return { success: false, error: 'No autorizado para devolver esta llave' }
    }

    if (transaction.status !== 'CHECKED_OUT') {
      return { success: false, error: 'La llave ya fue devuelta' }
    }

    // Update transaction and key status
    await prisma.$transaction([
      prisma.keyTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'CHECKED_IN',
          checkinTime: new Date(),
          vehicleCondition: returnData.vehicleCondition,
          incidentReport: returnData.incidentReport || null
        }
      }),
      prisma.key.update({
        where: { id: transaction.keyId },
        data: { status: 'AVAILABLE' }
      })
    ])

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Checkin error:', error)
    return { success: false, error: 'Error al devolver la llave' }
  }
}
