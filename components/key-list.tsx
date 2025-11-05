'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { checkoutKey } from '@/app/dashboard/actions'

interface KeyWithTransactions {
  id: string
  keyNumber: string
  location: string
  status: string
  notes: string | null
  vehicle: {
    plateNumber: string
    vehicleType: string
    unitNumber: string
    brand: string
    model: string
    year: number
    color: string | null
    status: string
  }
  keyTransactions: {
    user: {
      fullName: string
      employeeId: string
    }
  }[]
}

interface KeyListProps {
  keys: KeyWithTransactions[]
  userId: string
  userRole?: string
}

export function KeyList({ keys, userId, userRole }: KeyListProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [loadingKeyId, setLoadingKeyId] = useState<string | null>(null)

  const handleCheckout = async (keyId: string) => {
    setError(null)
    setLoadingKeyId(keyId)
    
    startTransition(async () => {
      const result = await checkoutKey(keyId)
      
      if (!result.success) {
        setError(result.error || 'Error checking out key')
      }
      
      setLoadingKeyId(null)
    })
  }

  if (keys.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <p className="mt-4 text-sm text-gray-600">No keys registered</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keys.map((key) => {
          const isAvailable = key.status === 'AVAILABLE'
          const currentTransaction = key.keyTransactions[0]
          const isLoading = isPending && loadingKeyId === key.id
          
          // Determinar el badge de estado de la llave
          const getKeyStatusBadge = () => {
            switch (key.status) {
              case 'AVAILABLE':
                return <Badge variant="success">Available</Badge>
              case 'CHECKED_OUT':
                return <Badge variant="warning">Checked Out</Badge>
              case 'MAINTENANCE':
                return <Badge variant="info">Maintenance</Badge>
              case 'LOST':
                return <Badge variant="danger">Lost</Badge>
              default:
                return <Badge variant="default">{key.status}</Badge>
            }
          }
          
          return (
            <div
              key={key.id}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">{key.keyNumber}</span>
                    {getKeyStatusBadge()}
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {key.vehicle.brand} {key.vehicle.model} {key.vehicle.year}
                  </p>
                  <p className="text-xs text-gray-500">
                    {key.vehicle.unitNumber} • Plate: {key.vehicle.plateNumber}
                  </p>
                </div>
                <div className="sm:ml-2">
                  <Badge variant={
                    key.vehicle.status === 'AVAILABLE' ? 'success' :
                    key.vehicle.status === 'IN_USE' ? 'warning' :
                    key.vehicle.status === 'MAINTENANCE' ? 'info' : 'danger'
                  }>
                    {key.vehicle.status === 'AVAILABLE' ? 'Available' :
                     key.vehicle.status === 'IN_USE' ? 'In Use' :
                     key.vehicle.status === 'MAINTENANCE' ? 'Maintenance' : 'Out of Service'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="break-words">Type: {key.vehicle.vehicleType}
                  {key.vehicle.color && ` • Color: ${key.vehicle.color}`}</span>
                </div>
                
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="break-words">{key.location}</span>
                </div>
                
                {!isAvailable && currentTransaction && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="break-words">{currentTransaction.user.fullName}</span>
                  </div>
                )}
                
                {key.notes && (
                  <p className="text-xs text-gray-500 mt-2 break-words">{key.notes}</p>
                )}
              </div>
              
              {/* Botón Retirar - Solo visible para DRIVER y CLEANING_STAFF */}
              {isAvailable && userRole !== 'DISPATCH' && (
                <Button
                  onClick={() => handleCheckout(key.id)}
                  className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                  size="sm"
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Check Out Key
                </Button>
              )}

              {!isAvailable && key.status === 'CHECKED_OUT' && currentTransaction && (
                <div className="w-full p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-800 mb-1 break-words">
                    Checked out to: {currentTransaction.user.fullName}
                  </p>
                  <p className="text-xs text-amber-600">
                    {new Date(currentTransaction.user.employeeId).toLocaleString('en-US')}
                  </p>
                </div>
              )}

              {key.status === 'MAINTENANCE' && (
                <div className="w-full p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800">
                    🔧 Key in maintenance
                  </p>
                </div>
              )}

              {key.status === 'LOST' && (
                <div className="w-full p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-800 break-words">
                    ⚠️ Lost key - Report to administration
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
