'use server'

import { createSession, verifyDispatch, verifyDriver } from '@/lib/auth'

export async function loginAction(
  userType: 'DISPATCH' | 'DRIVER',
  identifier: string,
  pin: string
) {
  try {
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
    return { success: false, error: 'Error al procesar la solicitud' }
  }
}
