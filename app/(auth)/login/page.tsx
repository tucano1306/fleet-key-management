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
      setError(`Por favor ingrese ${userType === 'DISPATCH' ? 'ID' : 'últimos 4 dígitos de licencia'} y PIN`)
      return
    }

    // Validar formato de licenseLast4 para DRIVER
    if (userType === 'DRIVER') {
      if (identifier.length !== 4 || !/^\d{4}$/.test(identifier)) {
        setError('Los últimos 4 dígitos de licencia deben ser exactamente 4 números')
        return
      }
    }

    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos')
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
        setError(result.error || 'Error al iniciar sesión')
      }
    })
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-center">Sistema de Gestión de Llaves</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Usuario</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as any)}
              className="w-full h-11 rounded-md border px-3"
            >
              <option value="DRIVER">Chofer / Staff</option>
              <option value="DISPATCH">Dispatch</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {userType === 'DISPATCH' ? 'ID' : 'Últimos 4 Dígitos de Licencia'}
            </label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={userType === 'DISPATCH' ? '0000' : '1234'}
              maxLength={userType === 'DISPATCH' ? 10 : 4}
              inputMode={userType === 'DRIVER' ? 'numeric' : 'text'}
              pattern={userType === 'DRIVER' ? '[0-9]{4}' : undefined}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PIN</label>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>

          {userType === 'DRIVER' && (
            <div className="text-center text-sm">
              <Link href="/register" className="text-primary-600">Regístrate</Link>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
