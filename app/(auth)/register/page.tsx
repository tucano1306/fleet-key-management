'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
// Server action for registration
import { registerAction } from './actions'

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    licenseNumber: '',
    role: 'DRIVER',
    pin: '',
    confirmPin: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones del lado del cliente
    if (!formData.fullName || !formData.licenseNumber || !formData.pin || !formData.confirmPin) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (formData.pin.length < 4 || formData.pin.length > 6) {
      setError('El PIN debe tener entre 4 y 6 dígitos')
      return
    }

    if (!/^\d+$/.test(formData.pin)) {
      setError('El PIN solo debe contener números')
      return
    }

    if (formData.pin !== formData.confirmPin) {
      setError('Los PINs no coinciden')
      return
    }

    startTransition(async () => {
      const result = await registerAction({
        fullName: formData.fullName,
        licenseNumber: formData.licenseNumber,
        role: formData.role as 'DRIVER' | 'CLEANING_STAFF',
        pin: formData.pin
      })

      if (result.success) {
        // Redirigir al login después del registro exitoso
        router.push('/login?registered=true')
      } else {
        setError(result.error || 'Error al registrar el chofer')
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Registro de Chofer
          </CardTitle>
          <CardDescription className="text-center">
            Completa el formulario para crear tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">
                Tipo de Personal
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isPending}
                className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="DRIVER">Chofer</option>
                <option value="CLEANING_STAFF">Personal de Limpieza</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">
                Número de Licencia
              </label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                placeholder="DL123456"
                value={formData.licenseNumber}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium text-gray-700">
                Crear PIN (4-6 dígitos)
              </label>
              <Input
                id="pin"
                name="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="••••"
                value={formData.pin}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPin" className="text-sm font-medium text-gray-700">
                Confirmar PIN
              </label>
              <Input
                id="confirmPin"
                name="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="••••"
                value={formData.confirmPin}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
              isLoading={isPending}
            >
              Registrarse
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                disabled={isPending}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
