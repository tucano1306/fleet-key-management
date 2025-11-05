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
        error: 'Not authenticated. Please log in again.'
      }
    }

    // Validar que el keyNumber no esté vacío
    if (!keyNumber || keyNumber.trim() === '') {
      return {
        success: false,
        error: 'You must enter a key number'
      }
    }

    // Limpiar y validar formato
    const cleanKeyNumber = keyNumber.trim().toUpperCase()

    if (cleanKeyNumber.length < 2 || cleanKeyNumber.length > 20) {
      return {
        success: false,
        error: 'Key number must be between 2 and 20 characters'
      }
    }

    const key = await prisma.key.findUnique({
      where: {
        keyNumber: cleanKeyNumber
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
        error: 'No key found with that number'
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
        error: `This key was already checked out by ${currentTransaction?.user.fullName}`
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
      error: 'Error searching for key'
    }
  }
}

export async function quickCheckoutKey(keyId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated. Please log in again.' }
    }

    // Validar que el keyId no esté vacío
    if (!keyId || keyId.trim() === '') {
      return { success: false, error: 'Invalid key ID' }
    }

    // Validar que el usuario no sea DISPATCH
    if (session.role === 'DISPATCH') {
      return { success: false, error: 'Dispatch personnel cannot check out keys from here' }
    }

    // Verify key exists and is available
    const key = await prisma.key.findUnique({
      where: { id: keyId },
      include: {
        keyTransactions: {
          where: { status: 'CHECKED_OUT' }
        }
      }
    })

    if (!key) {
      return { success: false, error: 'Key not found' }
    }

    if (key.status !== 'AVAILABLE') {
      return { 
        success: false, 
        error: `This key is not available. Status: ${
          key.status === 'CHECKED_OUT' ? 'Checked Out' :
          key.status === 'MAINTENANCE' ? 'In Maintenance' :
          key.status === 'LOST' ? 'Lost' : key.status
        }` 
      }
    }

    if (key.keyTransactions.length > 0) {
      return { success: false, error: 'This key is already in use by another user' }
    }

    // Verificar límite de llaves por usuario
    const userActiveTransactions = await prisma.keyTransaction.count({
      where: {
        userId: session.id,
        status: 'CHECKED_OUT'
      }
    })

    const MAX_KEYS_PER_USER = 5
    if (userActiveTransactions >= MAX_KEYS_PER_USER) {
      return { 
        success: false, 
        error: `You already have ${userActiveTransactions} keys checked out. Return some before checking out more.` 
      }
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
    return { success: false, error: 'Error registering key checkout' }
  }
}

export async function quickCheckinKey(transactionId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify transaction exists and belongs to current user
    const transaction = await prisma.keyTransaction.findUnique({
      where: { id: transactionId },
      include: { key: true }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.userId !== session.id) {
      return { success: false, error: 'You do not have permission to return this key' }
    }

    if (transaction.status !== 'CHECKED_OUT') {
      return { success: false, error: 'This transaction has already been completed' }
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
    return { success: false, error: 'Error registering key return' }
  }
}

export async function logoutAndRedirect() {
  await destroySession()
  redirect('/login')
}
