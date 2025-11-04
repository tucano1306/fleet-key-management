'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

interface RegisterData {
  fullName: string
  licenseLast4: string
  role: 'DRIVER' | 'CLEANING_STAFF'
  pin: string
}

export async function registerAction(data: RegisterData) {
  try {
    // Validaciones del servidor
    if (!data.fullName || !data.licenseLast4 || !data.pin) {
      return { success: false, error: 'Todos los campos son obligatorios' }
    }

    // Validar formato de los últimos 4 dígitos de licencia
    if (data.licenseLast4.length !== 4 || !/^\d{4}$/.test(data.licenseLast4)) {
      return { success: false, error: 'Los últimos 4 dígitos de licencia deben ser exactamente 4 números' }
    }

    // Validar formato del PIN
    if (data.pin.length < 4 || data.pin.length > 6) {
      return { success: false, error: 'El PIN debe tener entre 4 y 6 dígitos' }
    }

    if (!/^\d+$/.test(data.pin)) {
      return { success: false, error: 'El PIN solo debe contener números' }
    }

    // Generar employeeId automáticamente basado en los últimos 4 dígitos + timestamp
    const timestamp = Date.now().toString().slice(-4)
    const employeeId = `DRV${data.licenseLast4}${timestamp}`

    // Verificar que los últimos 4 dígitos de licencia no existan
    const existingLicense = await prisma.user.findUnique({
      where: { licenseLast4: data.licenseLast4 }
    })

    if (existingLicense) {
      return { success: false, error: 'Estos últimos 4 dígitos de licencia ya están registrados' }
    }

    // Hash del PIN
    const pinHash = await bcrypt.hash(data.pin, 10)

    // Crear el nuevo usuario
    await prisma.user.create({
      data: {
        employeeId: employeeId,
        fullName: data.fullName,
        licenseLast4: data.licenseLast4,
        role: data.role,
        pinHash: pinHash,
        isActive: true
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error en registro:', error)
    return { success: false, error: 'Error al registrar el usuario. Intenta nuevamente.' }
  }
}
