'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, calculateDuration } from '@/lib/utils'
import { checkinKey } from '@/app/dashboard/actions'

interface Transaction {
  id: string
  checkoutTime: Date
  key: {
    keyNumber: string
    location: string
    vehicle: {
      plateNumber: string
      vehicleType: string
      unitNumber: string
      brand: string
      model: string
      year: number
    }
  }
}

interface MyTransactionsProps {
  transactions: Transaction[]
}

interface ReturnFormData {
  vehicleCondition: string
  incidentReport: string
}

export function MyTransactions({ transactions }: MyTransactionsProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [loadingTransactionId, setLoadingTransactionId] = useState<string | null>(null)
  const [showReturnForm, setShowReturnForm] = useState<string | null>(null)
  const [returnFormData, setReturnFormData] = useState<ReturnFormData>({
    vehicleCondition: 'GOOD',
    incidentReport: ''
  })

  const handleCheckin = async (transactionId: string) => {
    setError(null)
    setLoadingTransactionId(transactionId)
    
    startTransition(async () => {
      const result = await checkinKey(transactionId, returnFormData)
      
      if (!result.success) {
        setError(result.error || 'Error al devolver la llave')
      } else {
        setShowReturnForm(null)
        setReturnFormData({ vehicleCondition: 'GOOD', incidentReport: '' })
      }
      
      setLoadingTransactionId(null)
    })
  }

  const handleShowReturnForm = (transactionId: string) => {
    setShowReturnForm(transactionId)
    setError(null)
  }

  const handleCancelReturn = () => {
    setShowReturnForm(null)
    setReturnFormData({ vehicleCondition: 'GOOD', incidentReport: '' })
    setError(null)
  }

  return (
    <Card className="bg-primary-50 border-primary-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Mis Llaves Retiradas ({transactions.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {transactions.map((transaction) => {
            const isLoading = isPending && loadingTransactionId === transaction.id
            const duration = calculateDuration(transaction.checkoutTime)
            
            return (
              <div
                key={transaction.id}
                className="bg-white border border-primary-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {transaction.key.keyNumber}
                      </span>
                      <Badge variant="info">Activa</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {transaction.key.vehicle.brand} {transaction.key.vehicle.model} {transaction.key.vehicle.year}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.key.vehicle.unitNumber} • Placa: {transaction.key.vehicle.plateNumber}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Tipo: {transaction.key.vehicle.vehicleType}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Retirada hace {duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(transaction.checkoutTime)}
                  </div>
                </div>
                
                {showReturnForm === transaction.id ? (
                  <div className="space-y-3 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900">Registro de Devolución</h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Estado del Vehículo *
                      </label>
                      <select
                        value={returnFormData.vehicleCondition}
                        onChange={(e) => setReturnFormData(prev => ({ ...prev, vehicleCondition: e.target.value }))}
                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                        disabled={isLoading}
                      >
                        <option value="GOOD">✅ Buen Estado - Sin incidentes</option>
                        <option value="MINOR_DAMAGE">⚠️ Daño Menor - Rayones, abolladuras leves</option>
                        <option value="MAJOR_DAMAGE">🔴 Daño Mayor - Requiere reparación</option>
                        <option value="ACCIDENT">🚨 Accidente - Requiere atención inmediata</option>
                      </select>
                    </div>
                    
                    {returnFormData.vehicleCondition !== 'GOOD' && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">
                          Descripción del Incidente *
                        </label>
                        <textarea
                          value={returnFormData.incidentReport}
                          onChange={(e) => setReturnFormData(prev => ({ ...prev, incidentReport: e.target.value }))}
                          placeholder="Describa lo sucedido con el vehículo..."
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleCheckin(transaction.id)}
                        variant="primary"
                        className="flex-1"
                        size="sm"
                        disabled={isLoading || (returnFormData.vehicleCondition !== 'GOOD' && !returnFormData.incidentReport.trim())}
                        isLoading={isLoading}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar Devolución
                      </Button>
                      <Button
                        onClick={handleCancelReturn}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleShowReturnForm(transaction.id)}
                    variant="primary"
                    className="w-full"
                    size="sm"
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Devolver Llave
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
