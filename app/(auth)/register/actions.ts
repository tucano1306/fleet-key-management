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
    if (!data.fullName || !data.licenseLast4 || !data.pin || !data.role) {
      return { success: false, error: 'All fields are required' }
    }

    // Limpiar espacios en blanco
    data.fullName = data.fullName.trim()
    data.licenseLast4 = data.licenseLast4.trim()
    data.pin = data.pin.trim()

    // Validar nombre completo
    if (data.fullName.length < 3) {
      return { success: false, error: 'Full name must be at least 3 characters long' }
    }

    if (data.fullName.length > 100) {
      return { success: false, error: 'Full name cannot exceed 100 characters' }
    }

    // Validar que el nombre solo contenga letras, espacios y acentos
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.fullName)) {
      return { success: false, error: 'Name can only contain letters and spaces' }
    }

    // Validar formato de los últimos 4 dígitos de licencia
    if (data.licenseLast4.length !== 4) {
      return { success: false, error: 'Last 4 digits of license must be exactly 4 characters' }
    }

    if (!/^\d{4}$/.test(data.licenseLast4)) {
      return { success: false, error: 'Last 4 digits of license must be only numbers' }
    }

    // Validar formato del PIN
    if (data.pin.length < 4 || data.pin.length > 6) {
      return { success: false, error: 'PIN must be between 4 and 6 digits' }
    }

    if (!/^\d+$/.test(data.pin)) {
      return { success: false, error: 'PIN must contain only numbers' }
    }

    // Validar rol
    if (data.role !== 'DRIVER' && data.role !== 'CLEANING_STAFF') {
      return { success: false, error: 'Invalid role' }
    }

    // Generar employeeId automáticamente basado en los últimos 4 dígitos + timestamp
    const timestamp = Date.now().toString().slice(-4)
    const rolePrefix = data.role === 'DRIVER' ? 'DRV' : 'CLN'
    const employeeId = `${rolePrefix}${data.licenseLast4}${timestamp}`

    // Verificar que los últimos 4 dígitos de licencia no existan
    const existingLicense = await prisma.user.findUnique({
      where: { licenseLast4: data.licenseLast4 }
    })

    if (existingLicense) {
      return { success: false, error: 'These last 4 digits of license are already registered' }
    }

    // Verificar que el employeeId sea único (por si acaso)
    const existingEmployee = await prisma.user.findUnique({
      where: { employeeId: employeeId }
    })

    if (existingEmployee) {
      // Regenerar con timestamp diferente
      const newTimestamp = (Date.now() + Math.floor(Math.random() * 1000)).toString().slice(-4)
      const newEmployeeId = `${rolePrefix}${data.licenseLast4}${newTimestamp}`
      
      const stillExists = await prisma.user.findUnique({
        where: { employeeId: newEmployeeId }
      })

      if (stillExists) {
        return { success: false, error: 'Error generating employee ID. Please try again.' }
      }
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
    return { success: false, error: 'Error registering user. Please try again.' }
  }
}
