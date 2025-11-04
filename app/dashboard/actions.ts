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
      return { success: false, error: 'No autorizado. Por favor inicia sesión nuevamente.' }
    }

    // Validar que el keyId no esté vacío
    if (!keyId || keyId.trim() === '') {
      return { success: false, error: 'ID de llave no válido' }
    }

    // Validar que el usuario no sea DISPATCH (solo DRIVER y CLEANING_STAFF pueden retirar)
    if (session.role === 'DISPATCH') {
      return { success: false, error: 'El personal de Dispatch no puede retirar llaves' }
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
      return { 
        success: false, 
        error: `La llave no está disponible. Estado actual: ${
          key.status === 'CHECKED_OUT' ? 'Prestada' :
          key.status === 'MAINTENANCE' ? 'En mantenimiento' :
          key.status === 'LOST' ? 'Extraviada' : key.status
        }` 
      }
    }

    if (key.keyTransactions.length > 0) {
      return { success: false, error: 'La llave ya está en uso por otro usuario' }
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
        error: `Ya tienes ${userActiveTransactions} llaves retiradas. Devuelve alguna antes de retirar más.` 
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
    return { success: false, error: 'Error al retirar la llave. Intenta nuevamente.' }
  }
}

export async function checkinKey(transactionId: string, returnData: ReturnData) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'No autorizado. Por favor inicia sesión nuevamente.' }
    }

    // Validar que el transactionId no esté vacío
    if (!transactionId || transactionId.trim() === '') {
      return { success: false, error: 'ID de transacción no válido' }
    }

    // Validar condición del vehículo
    const validConditions = ['GOOD', 'MINOR_DAMAGE', 'MAJOR_DAMAGE', 'ACCIDENT']
    if (!returnData.vehicleCondition || !validConditions.includes(returnData.vehicleCondition)) {
      return { success: false, error: 'Debe seleccionar una condición del vehículo válida' }
    }

    // Validar reporte de incidente si la condición no es GOOD
    if (returnData.vehicleCondition !== 'GOOD') {
      if (!returnData.incidentReport || returnData.incidentReport.trim() === '') {
        return { 
          success: false, 
          error: 'Debes proporcionar un reporte del incidente cuando el vehículo no está en buenas condiciones' 
        }
      }

      if (returnData.incidentReport.trim().length < 10) {
        return { 
          success: false, 
          error: 'El reporte del incidente debe tener al menos 10 caracteres' 
        }
      }

      if (returnData.incidentReport.length > 1000) {
        return { 
          success: false, 
          error: 'El reporte del incidente no puede exceder 1000 caracteres' 
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
      return { success: false, error: 'Transacción no encontrada' }
    }

    if (transaction.userId !== session.id) {
      return { success: false, error: 'No estás autorizado para devolver esta llave' }
    }

    if (transaction.status !== 'CHECKED_OUT') {
      return { success: false, error: 'Esta llave ya fue devuelta anteriormente' }
    }

    // Verificar que haya pasado al menos 1 minuto desde el checkout (prevenir errores)
    const checkoutTime = new Date(transaction.checkoutTime).getTime()
    const now = Date.now()
    const minCheckoutDuration = 60 * 1000 // 1 minuto en ms

    if (now - checkoutTime < minCheckoutDuration) {
      return { 
        success: false, 
        error: 'Debe pasar al menos 1 minuto desde el retiro antes de poder devolver la llave' 
      }
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
    return { success: false, error: 'Error al devolver la llave. Intenta nuevamente.' }
  }
}
