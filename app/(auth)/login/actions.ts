'use server'

import { createSession, verifyDispatch, verifyDriver } from '@/lib/auth'

export async function loginAction(
  userType: 'DISPATCH' | 'DRIVER',
  identifier: string,
  pin: string
) {
  try {
    // Validaciones de entrada
    if (!identifier || !pin) {
      return { 
        success: false, 
        error: 'Todos los campos son obligatorios' 
      }
    }

    // Trim whitespace
    identifier = identifier.trim()
    pin = pin.trim()

    // Validaciones específicas por tipo de usuario
    if (userType === 'DISPATCH') {
      if (identifier.length === 0) {
        return { success: false, error: 'El ID de Dispatch no puede estar vacío' }
      }
    } else {
      // Validar formato de licenseLast4 para DRIVER
      if (identifier.length !== 4) {
        return { 
          success: false, 
          error: 'Los últimos 4 dígitos de licencia deben ser exactamente 4 caracteres' 
        }
      }
      if (!/^\d{4}$/.test(identifier)) {
        return { 
          success: false, 
          error: 'Los últimos 4 dígitos de licencia deben ser solo números' 
        }
      }
    }

    // Validar PIN
    if (pin.length < 4 || pin.length > 6) {
      return { 
        success: false, 
        error: 'El PIN debe tener entre 4 y 6 dígitos' 
      }
    }

    if (!/^\d+$/.test(pin)) {
      return { 
        success: false, 
        error: 'El PIN solo puede contener números' 
      }
    }
    
    let user = null
    
    if (userType === 'DISPATCH') {
      user = await verifyDispatch(identifier, pin)
    } else {
      user = await verifyDriver(identifier, pin)
    }
    
    if (!user) {
      return { 
        success: false, 
        error: userType === 'DISPATCH' 
          ? 'ID de Dispatch o PIN incorrectos' 
          : 'Número de licencia o PIN incorrectos' 
      }
    }
    
    await createSession(user.id)
    
    return { 
      success: true, 
      role: user.role 
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Error al procesar la solicitud. Intenta nuevamente.' }
  }
}
