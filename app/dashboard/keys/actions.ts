'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Server action para registrar llaves
interface RegisterKeyData {
  keyNumber: string
  vehicleId: string
  location: string
  notes?: string
}

export async function registerKeyAction(data: RegisterKeyData) {
  try {
    // Validaciones
    if (!data.keyNumber || !data.vehicleId || !data.location) {
      return { success: false, error: 'Todos los campos obligatorios deben estar completos' }
    }

    // Verificar que el número de llave no exista
    const existingKey = await prisma.key.findUnique({
      where: { keyNumber: data.keyNumber }
    })

    if (existingKey) {
      return { success: false, error: 'Este número de llave ya está registrado' }
    }

    // Verificar que el vehículo no tenga ya una llave asignada
    const vehicleWithKey = await prisma.key.findFirst({
      where: { vehicleId: data.vehicleId }
    })

    if (vehicleWithKey) {
      return { success: false, error: 'Este vehículo ya tiene una llave asignada' }
    }

    // Crear la llave
    await prisma.key.create({
      data: {
        keyNumber: data.keyNumber,
        vehicleId: data.vehicleId,
        location: data.location,
        notes: data.notes || null,
        status: 'AVAILABLE'
      }
    })

    revalidatePath('/dashboard/keys')
    return { success: true }
  } catch (error) {
    console.error('Error registrando llave:', error)
    return { success: false, error: 'Error al registrar la llave. Intenta nuevamente.' }
  }
}
