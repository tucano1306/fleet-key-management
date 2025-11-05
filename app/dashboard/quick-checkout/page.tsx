'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { searchKeyByNumber, quickCheckoutKey, quickCheckinKey, logoutAndRedirect, type KeyInfo } from './actions'

export default function QuickCheckoutPage() {
  const [keyNumber, setKeyNumber] = useState('')
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search when user types
  useEffect(() => {
    const searchKey = async () => {
      if (keyNumber.length === 0) {
        setKeyInfo(null)
        setError(null)
        return
      }

      setIsSearching(true)
      setError(null)
      
      const result = await searchKeyByNumber(keyNumber)
      
      if (result.success && result.key) {
        setKeyInfo(result)
        setError(null)
      } else {
        setKeyInfo(null)
        setError(result.error || null)
      }
      
      setIsSearching(false)
    }

    // Debounce search
    const timeoutId = setTimeout(searchKey, 500)
    return () => clearTimeout(timeoutId)
  }, [keyNumber])

  const handleConfirm = async () => {
    if (!keyInfo?.key) return

    setIsProcessing(true)
    setError(null)

    // If key is already checked out by current user, return it
    if (keyInfo.key.status === 'CHECKED_OUT_BY_ME' && keyInfo.key.currentTransaction) {
      const result = await quickCheckinKey(keyInfo.key.currentTransaction.id)

      if (result.success) {
        setSuccessMessage(`✓ Key ${keyInfo.key.keyNumber} returned successfully`)
        setKeyNumber('')
        setKeyInfo(null)
        
        // Logout and redirect after 2 seconds
        setTimeout(async () => {
          await logoutAndRedirect()
        }, 2000)
      } else {
        setError(result.error || 'Error processing the return')
        setIsProcessing(false)
      }
    } else {
      // Otherwise, check it out
      const result = await quickCheckoutKey(keyInfo.key.id)

      if (result.success) {
        setSuccessMessage(`✓ Key ${keyInfo.key.keyNumber} checked out successfully`)
        setKeyNumber('')
        setKeyInfo(null)
        
        // Logout and redirect after 2 seconds
        setTimeout(async () => {
          await logoutAndRedirect()
        }, 2000)
      } else {
        setError(result.error || 'Error processing the checkout')
        setIsProcessing(false)
      }
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyInfo?.key && !isProcessing) {
      handleConfirm()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft"></div>
      
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 pt-4 sm:pt-8 relative z-10">
        {/* Header */}
        <div className="text-center px-2 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-glow mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Quick Checkout
          </h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-600">
            Scan or enter key number
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="border-0 bg-gradient-to-r from-success-50 to-emerald-50 shadow-glow-green animate-fade-in">
            <CardContent className="pt-4 sm:pt-6 px-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-center text-lg sm:text-xl font-bold text-success-700">
                {successMessage}
              </p>
              <p className="text-center text-xs sm:text-sm text-success-600 mt-2">
                Logging out for security...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Input Card */}
        <Card className="shadow-2xl border-0 overflow-hidden animate-slide-up">
          <div className="gradient-primary h-1"></div>
          <CardHeader className="px-4 sm:px-6 bg-gradient-to-br from-white to-gray-50">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Key Number</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-500">
              Enter the code of the key you need
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
            <Input
              ref={inputRef}
              type="text"
              placeholder="K001"
              value={keyNumber}
              onChange={(e) => setKeyNumber(e.target.value.toUpperCase())}
              onKeyDown={handleKeyPress}
              className="h-14 sm:h-16 md:h-20 text-center text-xl sm:text-2xl md:text-3xl font-bold uppercase border-2 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all shadow-sm"
              disabled={isProcessing}
              autoComplete="off"
            />

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-gradient-to-r from-danger-50 to-red-50 border border-danger-200 p-3 sm:p-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-danger-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm sm:text-base text-danger-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm sm:text-base text-primary-600 font-medium">Searching for key...</p>
                </div>
              </div>
            )}

            {/* Key Info Display */}
            {keyInfo?.key && !isSearching && (
              <div className="space-y-4">
                <div className={`rounded-lg p-4 sm:p-6 ${
                  keyInfo.key.status === 'CHECKED_OUT_BY_ME' 
                    ? 'bg-amber-50 border-2 border-amber-300' 
                    : 'bg-primary-50'
                }`}>
                  <h3 className="mb-4 text-center text-lg sm:text-xl font-bold text-primary-900">
                    {keyInfo.key.status === 'CHECKED_OUT_BY_ME' 
                      ? '⚠️ This key is already in your possession' 
                      : 'Vehicle Found'}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-primary-200 pb-2 gap-1">
                      <span className="font-semibold text-primary-700 text-sm sm:text-base">Unit Number:</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary-900">
                        {keyInfo.key.vehicle.unitNumber}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-primary-200 pb-2 gap-1">
                      <span className="font-semibold text-primary-700 text-sm sm:text-base">Plate:</span>
                      <span className="font-bold text-primary-900 text-base sm:text-lg">
                        {keyInfo.key.vehicle.plateNumber}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-primary-200 pb-2 gap-1">
                      <span className="font-semibold text-primary-700 text-sm sm:text-base">Type:</span>
                      <span className="text-primary-900 text-sm sm:text-base">{keyInfo.key.vehicle.vehicleType}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="font-semibold text-primary-700 text-sm sm:text-base">Vehicle:</span>
                      <span className="text-primary-900 text-sm sm:text-base">
                        {keyInfo.key.vehicle.brand} {keyInfo.key.vehicle.model}
                      </span>
                    </div>

                    {keyInfo.key.status === 'CHECKED_OUT_BY_ME' && keyInfo.key.currentTransaction && (
                      <div className="mt-4 pt-4 border-t-2 border-amber-300">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-semibold text-amber-700 text-sm sm:text-base">Checked out since:</span>
                          <span className="text-amber-900 font-bold text-sm sm:text-base">
                            {new Date(keyInfo.key.currentTransaction.checkoutTime).toLocaleString('en-US', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Button */}
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`h-12 sm:h-14 w-full text-base sm:text-lg md:text-xl font-bold ${
                    keyInfo.key.status === 'CHECKED_OUT_BY_ME'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : ''
                  }`}
                  size="lg"
                >
                  {isProcessing 
                    ? 'Processing...' 
                    : keyInfo.key.status === 'CHECKED_OUT_BY_ME'
                      ? '✓ Return Key (Enter)'
                      : 'Confirm Checkout (Enter)'
                  }
                </Button>

                <p className="text-center text-xs sm:text-sm text-primary-600 px-2">
                  {keyInfo.key.status === 'CHECKED_OUT_BY_ME'
                    ? 'Press Enter or click to return the key'
                    : 'Press Enter or click the button to confirm'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
