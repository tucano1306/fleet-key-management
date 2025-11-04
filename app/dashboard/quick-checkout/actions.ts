'use server'

import { prisma } from '@/lib/prisma'
import { getSession, destroySession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface KeyInfo {
  success: boolean
  key?: {
    id: string
    keyNumber: string
    status: 'AVAILABLE' | 'CHECKED_OUT_BY_ME' | 'CHECKED_OUT_BY_OTHER'
    vehicle: {
      unitNumber: string
      plateNumber: string
      vehicleType: string
      brand: string
      model: string
    }
    currentTransaction?: {
      id: string
      checkoutTime: Date
      user: {
        fullName: string
      }
    }
  }
  error?: string
}

export async function searchKeyByNumber(keyNumber: string): Promise<KeyInfo> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        error: 'No autenticado'
      }
    }

    const key = await prisma.key.findUnique({
      where: {
        keyNumber: keyNumber.trim().toUpperCase()
      },
      include: {
        vehicle: {
          select: {
            unitNumber: true,
            plateNumber: true,
            vehicleType: true,
            brand: true,
            model: true
          }
        },
        keyTransactions: {
          where: {
            status: 'CHECKED_OUT'
          },
          include: {
            user: {
              select: {
                fullName: true
              }
            }
          },
          take: 1
        }
      }
    })

    if (!key) {
      return {
        success: false,
        error: 'No se encontró ninguna llave con ese número'
      }
    }

    // Determine the status relative to current user
    let keyStatus: 'AVAILABLE' | 'CHECKED_OUT_BY_ME' | 'CHECKED_OUT_BY_OTHER' = 'AVAILABLE'
    let currentTransaction = undefined

    if (key.status === 'CHECKED_OUT' && key.keyTransactions.length > 0) {
      const transaction = key.keyTransactions[0]
      currentTransaction = {
        id: transaction.id,
        checkoutTime: transaction.checkoutTime,
        user: transaction.user
      }

      if (transaction.userId === session.id) {
        keyStatus = 'CHECKED_OUT_BY_ME'
      } else {
        keyStatus = 'CHECKED_OUT_BY_OTHER'
      }
    }

    // If checked out by someone else, don't allow any action
    if (keyStatus === 'CHECKED_OUT_BY_OTHER') {
      return {
        success: false,
        error: `Esta llave ya fue retirada por ${currentTransaction?.user.fullName}`
      }
    }

    return {
      success: true,
      key: {
        id: key.id,
        keyNumber: key.keyNumber,
        status: keyStatus,
        vehicle: key.vehicle,
        currentTransaction
      }
    }
  } catch (error) {
    console.error('Error searching key:', error)
    return {
      success: false,
      error: 'Error al buscar la llave'
    }
  }
}

export async function quickCheckoutKey(keyId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'No autenticado' }
    }

    // Verify key exists and is available
    const key = await prisma.key.findUnique({
      where: { id: keyId }
    })

    if (!key) {
      return { success: false, error: 'Llave no encontrada' }
    }

    if (key.status !== 'AVAILABLE') {
      return { success: false, error: 'Esta llave no está disponible' }
    }

    // Create transaction and update key status atomically
    await prisma.$transaction([
      prisma.keyTransaction.create({
        data: {
          keyId: keyId,
          userId: session.id,
          status: 'CHECKED_OUT'
        }
      }),
      prisma.key.update({
        where: { id: keyId },
        data: { status: 'CHECKED_OUT' }
      })
    ])

    revalidatePath('/dashboard/quick-checkout')
    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error in quick checkout:', error)
    return { success: false, error: 'Error al registrar el retiro de llave' }
  }
}

export async function quickCheckinKey(transactionId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'No autenticado' }
    }

    // Verify transaction exists and belongs to current user
    const transaction = await prisma.keyTransaction.findUnique({
      where: { id: transactionId },
      include: { key: true }
    })

    if (!transaction) {
      return { success: false, error: 'Transacción no encontrada' }
    }

    if (transaction.userId !== session.id) {
      return { success: false, error: 'No tienes permiso para devolver esta llave' }
    }

    if (transaction.status !== 'CHECKED_OUT') {
      return { success: false, error: 'Esta transacción ya fue completada' }
    }

    // Update transaction and key status atomically
    await prisma.$transaction([
      prisma.keyTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'CHECKED_IN',
          checkinTime: new Date()
        }
      }),
      prisma.key.update({
        where: { id: transaction.keyId },
        data: { status: 'AVAILABLE' }
      })
    ])

    revalidatePath('/dashboard/quick-checkout')
    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error in quick checkin:', error)
    return { success: false, error: 'Error al registrar la devolución de llave' }
  }
}

export async function logoutAndRedirect() {
  await destroySession()
  redirect('/login')
}
