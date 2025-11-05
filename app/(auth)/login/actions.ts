'use server'

import { createSession, verifyDispatch, verifyDriver } from '@/lib/auth'

export async function loginAction(
  userType: 'DISPATCH' | 'DRIVER',
  identifier: string,
  pin: string
) {
  try {
    // Input validations
    if (!identifier || !pin) {
      return { 
        success: false, 
        error: 'All fields are required' 
      }
    }

    // Trim whitespace
    identifier = identifier.trim()
    pin = pin.trim()

    // User type specific validations
    if (userType === 'DISPATCH') {
      if (identifier.length === 0) {
        return { success: false, error: 'Dispatch ID cannot be empty' }
      }
    } else {
      // Validate licenseLast4 format for DRIVER
      if (identifier.length !== 4) {
        return { 
          success: false, 
          error: 'Last 4 digits of license must be exactly 4 characters' 
        }
      }
      if (!/^\d{4}$/.test(identifier)) {
        return { 
          success: false, 
          error: 'Last 4 digits of license must be numbers only' 
        }
      }
    }

    // Validate PIN
    if (pin.length < 4 || pin.length > 6) {
      return { 
        success: false, 
        error: 'PIN must be between 4 and 6 digits' 
      }
    }

    if (!/^\d+$/.test(pin)) {
      return { 
        success: false, 
        error: 'PIN can only contain numbers' 
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
          ? 'Incorrect Dispatch ID or PIN' 
          : 'Incorrect license number or PIN' 
      }
    }
    
    await createSession(user.id)
    
    return { 
      success: true, 
      role: user.role 
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Error processing request. Please try again.' }
  }
}
