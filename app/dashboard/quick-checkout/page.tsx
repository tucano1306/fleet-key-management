'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { searchKeyByNumber, quickCheckoutKey, type KeyInfo } from './actions'
import { useRouter } from 'next/navigation'

export default function QuickCheckoutPage() {
  const router = useRouter()
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

    const result = await quickCheckoutKey(keyInfo.key.id)

    if (result.success) {
      setSuccessMessage(`✓ Llave ${keyInfo.key.keyNumber} retirada exitosamente`)
      setKeyNumber('')
      setKeyInfo(null)
      
      // Clear success message and refocus after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
        inputRef.current?.focus()
      }, 3000)
    } else {
      setError(result.error || 'Error al procesar el retiro')
    }

    setIsProcessing(false)
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyInfo?.key && !isProcessing) {
      handleConfirm()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="mx-auto max-w-2xl space-y-6 pt-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-900">Retiro Rápido de Llaves</h1>
          <p className="mt-2 text-lg text-primary-700">
            Ingresa el número de la llave para comenzar
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-center text-xl font-semibold text-green-700">
                {successMessage}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Input Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Número de Llave</CardTitle>
            <CardDescription>
              Ingresa el número de la llave que deseas retirar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ej: KEY-001"
              value={keyNumber}
              onChange={(e) => setKeyNumber(e.target.value.toUpperCase())}
              onKeyDown={handleKeyPress}
              className="h-16 text-center text-2xl font-bold uppercase"
              disabled={isProcessing}
              autoComplete="off"
            />

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="text-center">
                <p className="text-primary-600">Buscando llave...</p>
              </div>
            )}

            {/* Key Info Display */}
            {keyInfo?.key && !isSearching && (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary-50 p-6">
                  <h3 className="mb-4 text-center text-xl font-bold text-primary-900">
                    Unidad Encontrada
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-primary-200 pb-2">
                      <span className="font-semibold text-primary-700">Número de Unidad:</span>
                      <span className="text-2xl font-bold text-primary-900">
                        {keyInfo.key.vehicle.unitNumber}
                      </span>
                    </div>
                    
                    <div className="flex justify-between border-b border-primary-200 pb-2">
                      <span className="font-semibold text-primary-700">Placa:</span>
                      <span className="font-bold text-primary-900">
                        {keyInfo.key.vehicle.plateNumber}
                      </span>
                    </div>
                    
                    <div className="flex justify-between border-b border-primary-200 pb-2">
                      <span className="font-semibold text-primary-700">Tipo:</span>
                      <span className="text-primary-900">{keyInfo.key.vehicle.vehicleType}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold text-primary-700">Vehículo:</span>
                      <span className="text-primary-900">
                        {keyInfo.key.vehicle.brand} {keyInfo.key.vehicle.model}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="h-14 w-full text-xl font-bold"
                  size="lg"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar Retiro (Enter)'}
                </Button>

                <p className="text-center text-sm text-primary-600">
                  Presiona Enter o haz clic en el botón para confirmar
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-primary-700 hover:text-primary-900"
          >
            ← Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
