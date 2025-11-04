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
        setSuccessMessage(`✓ Llave ${keyInfo.key.keyNumber} devuelta exitosamente`)
        setKeyNumber('')
        setKeyInfo(null)
        
        // Logout and redirect after 2 seconds
        setTimeout(async () => {
          await logoutAndRedirect()
        }, 2000)
      } else {
        setError(result.error || 'Error al procesar la devolución')
        setIsProcessing(false)
      }
    } else {
      // Otherwise, check it out
      const result = await quickCheckoutKey(keyInfo.key.id)

      if (result.success) {
        setSuccessMessage(`✓ Llave ${keyInfo.key.keyNumber} retirada exitosamente`)
        setKeyNumber('')
        setKeyInfo(null)
        
        // Logout and redirect after 2 seconds
        setTimeout(async () => {
          await logoutAndRedirect()
        }, 2000)
      } else {
        setError(result.error || 'Error al procesar el retiro')
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 pt-4 sm:pt-8">
        {/* Header */}
        <div className="text-center px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-900">Retiro Rápido de Llaves</h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-primary-700">
            Ingresa el número de la llave para comenzar
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 sm:pt-6 px-4">
              <p className="text-center text-lg sm:text-xl font-semibold text-green-700">
                {successMessage}
              </p>
              <p className="text-center text-xs sm:text-sm text-green-600 mt-2">
                Cerrando sesión por seguridad...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Input Card */}
        <Card className="shadow-xl">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Número de Llave</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Ingresa el número de la llave que deseas retirar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ej: KEY-001"
              value={keyNumber}
              onChange={(e) => setKeyNumber(e.target.value.toUpperCase())}
              onKeyDown={handleKeyPress}
              className="h-12 sm:h-14 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-bold uppercase"
              disabled={isProcessing}
              autoComplete="off"
            />

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 sm:p-4 text-center">
                <p className="text-sm sm:text-base text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-2">
                <p className="text-sm sm:text-base text-primary-600">Buscando llave...</p>
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
                      ? '⚠️ Esta llave ya está en tu posesión' 
                      : 'Unidad Encontrada'}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-primary-200 pb-2 gap-1">
                      <span className="font-semibold text-primary-700 text-sm sm:text-base">Número de Unidad:</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary-900">
                        {keyInfo.key.vehicle.unitNumber}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-primary-200 pb-2 gap-1">
                      <span className="font-semibold text-primary-700 text-sm sm:text-base">Placa:</span>
                      <span className="font-bold text-primary-900 text-base sm:text-lg">
                        {keyInfo.key.vehicle.plateNumber}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-primary-200 pb-2 gap-1">
                      <span className="font-semibold text-primary-700 text-sm sm:text-base">Tipo:</span>
                      <span className="text-primary-900 text-sm sm:text-base">{keyInfo.key.vehicle.vehicleType}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="font-semibold text-primary-700 text-sm sm:text-base">Vehículo:</span>
                      <span className="text-primary-900 text-sm sm:text-base">
                        {keyInfo.key.vehicle.brand} {keyInfo.key.vehicle.model}
                      </span>
                    </div>

                    {keyInfo.key.status === 'CHECKED_OUT_BY_ME' && keyInfo.key.currentTransaction && (
                      <div className="mt-4 pt-4 border-t-2 border-amber-300">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-semibold text-amber-700 text-sm sm:text-base">Retirada desde:</span>
                          <span className="text-amber-900 font-bold text-sm sm:text-base">
                            {new Date(keyInfo.key.currentTransaction.checkoutTime).toLocaleString('es-ES', {
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
                    ? 'Procesando...' 
                    : keyInfo.key.status === 'CHECKED_OUT_BY_ME'
                      ? '✓ Devolver Llave (Enter)'
                      : 'Confirmar Retiro (Enter)'
                  }
                </Button>

                <p className="text-center text-xs sm:text-sm text-primary-600 px-2">
                  {keyInfo.key.status === 'CHECKED_OUT_BY_ME'
                    ? 'Presiona Enter o haz clic para devolver la llave'
                    : 'Presiona Enter o haz clic en el botón para confirmar'
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
