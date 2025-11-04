import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export interface AuthUser {
  id: string
  employeeId: string
  fullName: string
  licenseLast4: string | null
  dispatchId: string | null
  role: string // 'DISPATCH', 'DRIVER', or 'CLEANING_STAFF'
}

const SESSION_COOKIE_NAME = 'key_mgmt_session'
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

export async function createSession(userId: string): Promise<void> {
  const sessionData = {
    userId,
    expiresAt: Date.now() + SESSION_DURATION,
  }
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // in seconds
    path: '/',
  })
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return null
    }
    
    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      await destroySession()
      return null
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId, isActive: true },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        licenseLast4: true,
        dispatchId: true,
        role: true,
      },
    })
    
    return user
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Verify DISPATCH by ID and PIN
export async function verifyDispatch(dispatchId: string, pin: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { dispatchId, isActive: true },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        licenseLast4: true,
        dispatchId: true,
        role: true,
        pinHash: true,
      },
    })
    
    if (!user || user.role !== 'DISPATCH') {
      return null
    }
    
    const isValid = await bcrypt.compare(pin, user.pinHash)
    
    if (!isValid) {
      return null
    }
    
    // Remove pinHash from returned user
    const { pinHash, ...userWithoutPin } = user
    return userWithoutPin
  } catch (error) {
    console.error('Dispatch verification error:', error)
    return null
  }
}

// Verify DRIVER/CLEANING_STAFF by Last 4 Digits of License and PIN
export async function verifyDriver(licenseLast4: string, pin: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { licenseLast4, isActive: true },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        licenseLast4: true,
        dispatchId: true,
        role: true,
        pinHash: true,
      },
    })
    
    if (!user || (user.role !== 'DRIVER' && user.role !== 'CLEANING_STAFF')) {
      return null
    }
    
    const isValid = await bcrypt.compare(pin, user.pinHash)
    
    if (!isValid) {
      return null
    }
    
    // Remove pinHash from returned user
    const { pinHash, ...userWithoutPin } = user
    return userWithoutPin
  } catch (error) {
    console.error('Driver verification error:', error)
    return null
  }
}