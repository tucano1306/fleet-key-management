import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KeyRegistrationForm } from '@/components/key-registration-form'

export const dynamic = 'force-dynamic'

export default async function KeysManagementPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Obtener todas las llaves con información del vehículo
  const keys = await prisma.key.findMany({
    include: {
      vehicle: true,
      keyTransactions: {
        where: { status: 'CHECKED_OUT' },
        include: {
          user: {
            select: {
              fullName: true,
              licenseNumber: true
            }
          }
        }
      }
    },
    orderBy: {
      keyNumber: 'asc'
    }
  })

  // Obtener vehículos sin llave asignada
  const vehiclesWithoutKeys = await prisma.vehicle.findMany({
    where: {
      keys: {
        none: {}
      }
    },
    orderBy: {
      unitNumber: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Llaves</h1>
          <p className="text-gray-600 mt-1">Registra y administra las llaves de los vehículos</p>
        </div>
        <Badge variant="info">{keys.length} Llaves Registradas</Badge>
      </div>

      {/* Formulario para registrar nueva llave */}
      <KeyRegistrationForm vehicles={vehiclesWithoutKeys} />

      {/* Lista de llaves registradas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Llaves Registradas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keys.map((key) => {
            const currentTransaction = key.keyTransactions[0]
            
            return (
              <Card key={key.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{key.keyNumber}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {key.vehicle.brand} {key.vehicle.model} {key.vehicle.year}
                      </p>
                      <p className="text-xs text-gray-400">
                        {key.vehicle.unitNumber} • {key.vehicle.plateNumber}
                      </p>
                    </div>
                    <Badge variant={
                      key.status === 'AVAILABLE' ? 'success' :
                      key.status === 'CHECKED_OUT' ? 'warning' :
                      key.status === 'MAINTENANCE' ? 'info' : 'danger'
                    }>
                      {key.status === 'AVAILABLE' ? 'Disponible' :
                       key.status === 'CHECKED_OUT' ? 'Prestada' :
                       key.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Extraviada'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ubicación: {key.location}
                    </div>
                    
                    {currentTransaction && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-amber-800 mb-1">Prestada a:</p>
                        <p className="text-xs text-amber-700">{currentTransaction.user.fullName}</p>
                        <p className="text-xs text-amber-600">
                          Desde: {new Date(currentTransaction.checkoutTime).toLocaleString('es-ES')}
                        </p>
                      </div>
                    )}
                    
                    {key.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Nota: {key.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {keys.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <p className="mt-4 text-gray-600">No hay llaves registradas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
