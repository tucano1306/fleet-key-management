'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

interface RegisterData {
  fullName: string
  licenseNumber: string
  role: 'DRIVER' | 'CLEANING_STAFF'
  pin: string
}

export async function registerAction(data: RegisterData) {
  try {
    // Validaciones del servidor
    if (!data.fullName || !data.licenseNumber || !data.pin) {
      return { success: false, error: 'Todos los campos son obligatorios' }
    }

    // Validar formato del PIN
    if (data.pin.length < 4 || data.pin.length > 6) {
      return { success: false, error: 'El PIN debe tener entre 4 y 6 dígitos' }
    }

    if (!/^\d+$/.test(data.pin)) {
      return { success: false, error: 'El PIN solo debe contener números' }
    }

    // Generar employeeId automáticamente basado en el número de licencia
    // Usar las primeras letras/números de la licencia + timestamp único
    const timestamp = Date.now().toString().slice(-4)
    const licensePrefix = data.licenseNumber.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()
    const employeeId = `${licensePrefix}${timestamp}`

    // Verificar que el número de licencia no exista
    const existingLicense = await prisma.user.findUnique({
      where: { licenseNumber: data.licenseNumber }
    })

    if (existingLicense) {
      return { success: false, error: 'Este número de licencia ya está registrado' }
    }

    // Hash del PIN
    const pinHash = await bcrypt.hash(data.pin, 10)

    // Crear el nuevo usuario
    await prisma.user.create({
      data: {
        employeeId: employeeId,
        fullName: data.fullName,
        licenseNumber: data.licenseNumber,
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
