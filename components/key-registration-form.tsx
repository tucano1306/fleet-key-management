'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { registerKeyAction } from '@/app/dashboard/keys/actions'

interface Vehicle {
  id: string
  plateNumber: string
  vehicleType: string
  unitNumber: string
  brand: string
  model: string
  year: number
}

interface KeyRegistrationFormProps {
  vehicles: Vehicle[]
}

export function KeyRegistrationForm({ vehicles }: KeyRegistrationFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    keyNumber: '',
    vehicleId: '',
    location: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.keyNumber || !formData.vehicleId || !formData.location) {
      setError('Número de llave, vehículo y ubicación son obligatorios')
      return
    }

    startTransition(async () => {
      const result = await registerKeyAction(formData)

      if (result.success) {
        setSuccess('¡Llave registrada exitosamente!')
        setFormData({
          keyNumber: '',
          vehicleId: '',
          location: '',
          notes: ''
        })
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Error al registrar la llave')
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="bg-primary-50 border-primary-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Registrar Nueva Llave</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="keyNumber" className="text-sm font-medium text-gray-700">
                Número de Llave *
              </label>
              <Input
                id="keyNumber"
                name="keyNumber"
                type="text"
                placeholder="Ej: K001"
                value={formData.keyNumber}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="vehicleId" className="text-sm font-medium text-gray-700">
                Vehículo Asignado *
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                disabled={isPending}
                required
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar vehículo...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.unitNumber} - {vehicle.brand} {vehicle.model} ({vehicle.plateNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Ubicación de Almacenamiento *
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="Ej: Gancho A1, Gabinete B2"
                value={formData.location}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notas (Opcional)
              </label>
              <Input
                id="notes"
                name="notes"
                type="text"
                placeholder="Información adicional..."
                value={formData.notes}
                onChange={handleChange}
                disabled={isPending}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={isPending || vehicles.length === 0}
            isLoading={isPending}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Registrar Llave
          </Button>

          {vehicles.length === 0 && (
            <p className="text-sm text-amber-600">
              ⚠️ Todos los vehículos ya tienen llaves asignadas
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
