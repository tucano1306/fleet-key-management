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
      return { success: false, error: 'Not authorized. Please log in again.' }
    }

    // Validar que el keyId no esté vacío
    if (!keyId || keyId.trim() === '') {
      return { success: false, error: 'Invalid key ID' }
    }

    // Validar que el usuario no sea DISPATCH (solo DRIVER y CLEANING_STAFF pueden retirar)
    if (session.role === 'DISPATCH') {
      return { success: false, error: 'Dispatch personnel cannot check out keys' }
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
      return { success: false, error: 'Key not found' }
    }

    if (key.status !== 'AVAILABLE') {
      return { 
        success: false, 
        error: `The key is not available. Current status: ${
          key.status === 'CHECKED_OUT' ? 'Checked Out' :
          key.status === 'MAINTENANCE' ? 'In Maintenance' :
          key.status === 'LOST' ? 'Lost' : key.status
        }` 
      }
    }

    if (key.keyTransactions.length > 0) {
      return { success: false, error: 'The key is already in use by another user' }
    }

    // Verificar si el usuario ya tiene llaves prestadas (opcional: límite de llaves por usuario)
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
      }),
      prisma.vehicle.update({
        where: { id: key.vehicleId },
        data: { status: 'IN_USE' }
      })
    ])

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Checkout error:', error)
    return { success: false, error: 'Error checking out key. Please try again.' }
  }
}

export async function checkinKey(transactionId: string, returnData: ReturnData) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authorized. Please log in again.' }
    }

    // Validar que el transactionId no esté vacío
    if (!transactionId || transactionId.trim() === '') {
      return { success: false, error: 'Invalid transaction ID' }
    }

    // Validar condición del vehículo
    const validConditions = ['GOOD', 'MINOR_DAMAGE', 'MAJOR_DAMAGE', 'ACCIDENT']
    if (!returnData.vehicleCondition || !validConditions.includes(returnData.vehicleCondition)) {
      return { success: false, error: 'You must select a valid vehicle condition' }
    }

    // Validar reporte de incidente si la condición no es GOOD
    if (returnData.vehicleCondition !== 'GOOD') {
      if (!returnData.incidentReport || returnData.incidentReport.trim() === '') {
        return { 
          success: false, 
          error: 'You must provide an incident report when the vehicle is not in good condition' 
        }
      }

      if (returnData.incidentReport.trim().length < 10) {
        return { 
          success: false, 
          error: 'The incident report must be at least 10 characters long' 
        }
      }

      if (returnData.incidentReport.length > 1000) {
        return { 
          success: false, 
          error: 'The incident report cannot exceed 1000 characters' 
        }
      }
    }

    // Get transaction
    const transaction = await prisma.keyTransaction.findUnique({
      where: { id: transactionId },
      include: { 
        key: {
          include: {
            vehicle: true
          }
        }
      }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.userId !== session.id) {
      return { success: false, error: 'You are not authorized to return this key' }
    }

    if (transaction.status !== 'CHECKED_OUT') {
      return { success: false, error: 'This key was already returned previously' }
    }

    // Update transaction and key status
    await prisma.$transaction([
      prisma.keyTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'CHECKED_IN',
          checkinTime: new Date(),
          vehicleCondition: returnData.vehicleCondition,
          incidentReport: returnData.incidentReport?.trim() || null
        }
      }),
      prisma.key.update({
        where: { id: transaction.key.id },
        data: { status: 'AVAILABLE' }
      }),
      prisma.vehicle.update({
        where: { id: transaction.key.vehicleId },
        data: { 
          status: returnData.vehicleCondition === 'GOOD' ? 'AVAILABLE' : 'MAINTENANCE'
        }
      })
    ])

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Checkin error:', error)
    return { success: false, error: 'Error returning key. Please try again.' }
  }
}
