import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Obtener todas las transacciones activas (llaves prestadas)
  const activeLoans = await prisma.keyTransaction.findMany({
    where: {
      status: 'CHECKED_OUT'
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
          licenseLast4: true,
          employeeId: true
        }
      }
    },
    orderBy: {
      checkoutTime: 'desc'
    }
  })

  // Calcular llaves vencidas (más de 12 horas)
  const now = new Date()
  const overdueLoans = activeLoans.filter(loan => {
    const hoursSince = (now.getTime() - new Date(loan.checkoutTime).getTime()) / (1000 * 60 * 60)
    return hoursSince > 12
  })

  // Estadísticas generales
  const stats = {
    totalKeys: await prisma.key.count(),
    activeLoans: activeLoans.length,
    overdueLoans: overdueLoans.length,
    totalDrivers: await prisma.user.count(),
    availableKeys: await prisma.key.count({ where: { status: 'AVAILABLE' } }),
    maintenanceKeys: await prisma.key.count({ where: { status: 'MAINTENANCE' } }),
    lostKeys: await prisma.key.count({ where: { status: 'LOST' } })
  }

  // Transacciones recientes (últimas 10)
  const recentTransactions = await prisma.keyTransaction.findMany({
    where: {
      status: 'CHECKED_IN'
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
          employeeId: true
        }
      }
    },
    orderBy: {
      checkinTime: 'desc'
    },
    take: 10
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration Panel</h1>
          <p className="text-gray-600 mt-1">Real-time view of the key management system</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/dashboard/admin/reports">
            <Badge variant="info" className="cursor-pointer px-4 py-2">
              📊 View Reports
            </Badge>
          </Link>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Keys</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalKeys}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-orange-800">Checked Out</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.activeLoans}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={overdueLoans.length > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 ${overdueLoans.length > 0 ? 'bg-red-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center mb-2`}>
                <svg className={`w-6 h-6 ${overdueLoans.length > 0 ? 'text-red-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className={`text-sm font-medium ${overdueLoans.length > 0 ? 'text-red-800' : 'text-gray-600'}`}>Overdue</p>
              <p className={`text-2xl font-bold mt-1 ${overdueLoans.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.overdueLoans}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.availableKeys}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Drivers</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalDrivers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Llaves Vencidas */}
      {overdueLoans.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              ⚠️ Alerts: Unreturned Keys ({overdueLoans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueLoans.map(loan => {
                const hoursSince = Math.floor((now.getTime() - new Date(loan.checkoutTime).getTime()) / (1000 * 60 * 60))
                return (
                  <div key={loan.id} className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{loan.key.keyNumber}</span>
                          <Badge variant="danger">Overdue {hoursSince}h ago</Badge>
                        </div>
                        <p className="text-sm text-gray-700">
                          {loan.key.vehicle.brand} {loan.key.vehicle.model} • {loan.key.vehicle.plateNumber}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          Driver: <strong>{loan.user.fullName}</strong> {loan.user.licenseLast4 && `(Lic: ${loan.user.licenseLast4})`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Checked out: {new Date(loan.checkoutTime).toLocaleString('en-US')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Llaves Actualmente Prestadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Keys Checked Out in Real Time
            </span>
            <Badge variant="warning">{activeLoans.length} Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>All keys have been returned</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLoans.map(loan => {
                const hoursSince = Math.floor((now.getTime() - new Date(loan.checkoutTime).getTime()) / (1000 * 60 * 60))
                const isOverdue = hoursSince > 12
                return (
                  <div key={loan.id} className={`border rounded-lg p-4 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900">{loan.key.keyNumber}</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {loan.key.vehicle.brand} {loan.key.vehicle.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          {loan.key.vehicle.unitNumber} • {loan.key.vehicle.plateNumber}
                        </p>
                      </div>
                      {isOverdue && <Badge variant="danger">Vencida</Badge>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700">{loan.user.fullName}</p>
                      {loan.user.licenseLast4 && <p className="text-xs text-gray-500">Lic: {loan.user.licenseLast4}</p>}
                      <p className="text-xs text-gray-500 mt-1">Hace {hoursSince}h</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Últimas Devoluciones
            </span>
            <Link href="/dashboard/admin/history">
              <Badge variant="info" className="cursor-pointer">Ver Todo</Badge>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Llave</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Vehículo</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Chofer</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Devuelto</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(transaction => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium">{transaction.key.keyNumber}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.key.vehicle.brand} {transaction.key.vehicle.model}</p>
                        <p className="text-xs text-gray-500">{transaction.key.vehicle.plateNumber}</p>
                      </div>
                    </td>
                    <td className="p-3">{transaction.user.fullName}</td>
                    <td className="p-3 text-xs text-gray-600">
                      {transaction.checkinTime ? new Date(transaction.checkinTime).toLocaleString('es-ES') : '-'}
                    </td>
                    <td className="p-3">
                      {transaction.vehicleCondition && (
                        <Badge variant={
                          transaction.vehicleCondition === 'GOOD' ? 'success' :
                          transaction.vehicleCondition === 'MINOR_DAMAGE' ? 'warning' :
                          'danger'
                        }>
                          {transaction.vehicleCondition === 'GOOD' ? '✅ Bien' :
                           transaction.vehicleCondition === 'MINOR_DAMAGE' ? '⚠️ Daño Menor' :
                           transaction.vehicleCondition === 'MAJOR_DAMAGE' ? '🔴 Daño Mayor' :
                           '🚨 Accidente'}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
