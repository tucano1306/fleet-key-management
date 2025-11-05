'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginAction } from './actions'

export default function LoginPage() {
  const [userType, setUserType] = useState<'DISPATCH' | 'DRIVER'>('DRIVER')
  const [identifier, setIdentifier] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!identifier.trim() || !pin.trim()) {
      setError(`Please enter ${userType === 'DISPATCH' ? 'ID' : 'last 4 digits of license'} and PIN`)
      return
    }

    // Validate licenseLast4 format for DRIVER
    if (userType === 'DRIVER') {
      if (identifier.length !== 4 || !/^\d{4}$/.test(identifier)) {
        setError('Last 4 digits of license must be exactly 4 numbers')
        return
      }
    }

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    startTransition(async () => {
      const result = await loginAction(userType, identifier, pin)
      
      if (result.success) {
        if (result.role === 'DISPATCH') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard/quick-checkout')
        }
      } else {
        setError(result.error || 'Login error')
      }
    })
  }

  return (
    <Card className="shadow-2xl w-full max-w-md border-0 overflow-hidden animate-slide-up">
      <div className="gradient-primary h-2"></div>
      <CardHeader className="space-y-3 pb-6 px-4 sm:px-6 pt-8 bg-gradient-to-br from-white to-gray-50">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>
        <CardTitle className="text-center text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Key Management System
        </CardTitle>
        <p className="text-center text-sm text-gray-500">Intelligent Fleet Management</p>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-gradient-to-r from-danger-50 to-red-50 border border-danger-200 p-3 text-xs sm:text-sm text-danger-700 animate-fade-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              User Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as any)}
              className="w-full h-11 sm:h-12 rounded-xl border-2 border-gray-200 px-4 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none bg-white hover:border-gray-300"
            >
              <option value="DRIVER">🚗 Driver / Staff</option>
              <option value="DISPATCH">👔 Dispatch</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              {userType === 'DISPATCH' ? 'Dispatch ID' : 'Last 4 Digits of License'}
            </label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={userType === 'DISPATCH' ? '0000' : '1234'}
              maxLength={userType === 'DISPATCH' ? 10 : 4}
              inputMode={userType === 'DRIVER' ? 'numeric' : 'text'}
              pattern={userType === 'DRIVER' ? '[0-9]{4}' : undefined}
              className="h-11 sm:h-12 text-sm sm:text-base border-2 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security PIN
            </label>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              placeholder="••••••"
              className="h-11 sm:h-12 text-sm sm:text-base border-2 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 sm:h-12 text-sm sm:text-base gradient-primary border-0 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-6" 
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Log In
              </div>
            )}
          </Button>

          {userType === 'DRIVER' && (
            <div className="text-center text-xs sm:text-sm pt-2">
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all">
                First time? Register here →
              </Link>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
