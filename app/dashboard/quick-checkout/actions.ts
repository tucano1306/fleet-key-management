'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface KeyInfo {
  success: boolean
  key?: {
    id: string
    keyNumber: string
    vehicle: {
      unitNumber: string
      plateNumber: string
      vehicleType: string
      brand: string
      model: string
    }
  }
  error?: string
}

export async function searchKeyByNumber(keyNumber: string): Promise<KeyInfo> {
  try {
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
        }
      }
    })

    if (!key) {
      return {
        success: false,
        error: 'No se encontró ninguna llave con ese número'
      }
    }

    if (key.status !== 'AVAILABLE') {
      return {
        success: false,
        error: `Esta llave no está disponible. Estado actual: ${key.status}`
      }
    }

    return {
      success: true,
      key: {
        id: key.id,
        keyNumber: key.keyNumber,
        vehicle: key.vehicle
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
