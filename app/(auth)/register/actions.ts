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
      return { success: false, error: 'Todos los campos son obligatorios' }
    }

    // Limpiar espacios en blanco
    data.fullName = data.fullName.trim()
    data.licenseLast4 = data.licenseLast4.trim()
    data.pin = data.pin.trim()

    // Validar nombre completo
    if (data.fullName.length < 3) {
      return { success: false, error: 'El nombre completo debe tener al menos 3 caracteres' }
    }

    if (data.fullName.length > 100) {
      return { success: false, error: 'El nombre completo no puede exceder 100 caracteres' }
    }

    // Validar que el nombre solo contenga letras, espacios y acentos
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.fullName)) {
      return { success: false, error: 'El nombre solo puede contener letras y espacios' }
    }

    // Validar formato de los últimos 4 dígitos de licencia
    if (data.licenseLast4.length !== 4) {
      return { success: false, error: 'Los últimos 4 dígitos de licencia deben ser exactamente 4 caracteres' }
    }

    if (!/^\d{4}$/.test(data.licenseLast4)) {
      return { success: false, error: 'Los últimos 4 dígitos de licencia deben ser solo números' }
    }

    // Validar formato del PIN
    if (data.pin.length < 4 || data.pin.length > 6) {
      return { success: false, error: 'El PIN debe tener entre 4 y 6 dígitos' }
    }

    if (!/^\d+$/.test(data.pin)) {
      return { success: false, error: 'El PIN solo debe contener números' }
    }

    // Validar rol
    if (data.role !== 'DRIVER' && data.role !== 'CLEANING_STAFF') {
      return { success: false, error: 'Rol no válido' }
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
      return { success: false, error: 'Estos últimos 4 dígitos de licencia ya están registrados' }
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
        return { success: false, error: 'Error al generar ID de empleado. Intenta nuevamente.' }
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
    return { success: false, error: 'Error al registrar el usuario. Intenta nuevamente.' }
  }
}
