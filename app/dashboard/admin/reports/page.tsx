import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Reportes por vehículo
  const vehicleReports = await prisma.vehicle.findMany({
    include: {
      keys: {
        include: {
          keyTransactions: {
            where: {
              status: 'CHECKED_IN'
            }
          }
        }
      }
    },
    orderBy: {
      unitNumber: 'asc'
    }
  })

  // Reportes por conductor
  const driverReports = await prisma.user.findMany({
    include: {
      keyTransactions: {
        where: {
          status: 'CHECKED_IN'
        },
        include: {
          key: {
            include: {
              vehicle: true
            }
          }
        }
      }
    },
    orderBy: {
      fullName: 'asc'
    }
  })

  // Incidentes reportados
  const incidents = await prisma.keyTransaction.findMany({
    where: {
      AND: [
        { status: 'CHECKED_IN' },
        { vehicleCondition: { not: 'GOOD' } }
      ]
    },
    include: {
      key: {
        include: {
          vehicle: true
        }
      },
      user: {
        select: {
          fullName: true,
          licenseNumber: true
        }
      }
    },
    orderBy: {
      checkinTime: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">Análisis detallado de uso y rendimiento</p>
        </div>
        <Link href="/dashboard/admin">
          <Badge variant="default" className="cursor-pointer px-4 py-2">
            ← Volver al Panel
          </Badge>
        </Link>
      </div>

      {/* Reporte de Incidentes */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-900">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Incidentes Reportados ({incidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>✅ No hay incidentes reportados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map(incident => (
                <div key={incident.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{incident.key.vehicle.brand} {incident.key.vehicle.model}</span>
                        <Badge variant={
                          incident.vehicleCondition === 'MINOR_DAMAGE' ? 'warning' :
                          incident.vehicleCondition === 'MAJOR_DAMAGE' ? 'danger' :
                          'danger'
                        }>
                          {incident.vehicleCondition === 'MINOR_DAMAGE' ? '⚠️ Daño Menor' :
                           incident.vehicleCondition === 'MAJOR_DAMAGE' ? '🔴 Daño Mayor' :
                           '🚨 Accidente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placa: {incident.key.vehicle.plateNumber} • Unidad: {incident.key.vehicle.unitNumber}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Chofer:</strong> {incident.user.fullName} ({incident.user.licenseNumber})
                      </p>
                      {incident.incidentReport && (
                        <div className="mt-3 p-3 bg-amber-50 rounded border border-amber-200">
                          <p className="text-xs font-semibold text-amber-900 mb-1">Descripción del Incidente:</p>
                          <p className="text-sm text-amber-800">{incident.incidentReport}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Reportado: {incident.checkinTime ? new Date(incident.checkinTime).toLocaleString('es-ES') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reporte por Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Uso por Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleReports.map(vehicle => {
              const totalUses = vehicle.keys.reduce((sum, key) => sum + key.keyTransactions.length, 0)
              return (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-sm text-gray-500">{vehicle.unitNumber} • {vehicle.plateNumber}</p>
                    </div>
                    <Badge variant="info">{totalUses} usos</Badge>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Tipo: {vehicle.vehicleType}</p>
                    <p>Color: {vehicle.color || 'N/A'}</p>
                    <p>Año: {vehicle.year}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reporte por Conductor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Uso por Conductor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Conductor</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Licencia</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Total Usos</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Vehículos Más Usados</th>
                </tr>
              </thead>
              <tbody>
                {driverReports.map(driver => {
                  const vehicleUsage = driver.keyTransactions.reduce((acc, transaction) => {
                    const vehicleName = `${transaction.key.vehicle.brand} ${transaction.key.vehicle.model}`
                    acc[vehicleName] = (acc[vehicleName] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  
                  const topVehicles = Object.entries(vehicleUsage)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([name, count]) => `${name} (${count})`)
                    .join(', ')

                  return (
                    <tr key={driver.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{driver.fullName}</td>
                      <td className="p-3 text-gray-600">{driver.licenseNumber}</td>
                      <td className="p-3 text-center">
                        <Badge variant="info">{driver.keyTransactions.length}</Badge>
                      </td>
                      <td className="p-3 text-gray-600 text-xs">{topVehicles || 'Sin usos'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
