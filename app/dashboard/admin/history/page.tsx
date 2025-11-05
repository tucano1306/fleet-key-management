import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Solo DISPATCH puede ver esta página
  if (session.role !== 'DISPATCH') {
    redirect('/dashboard/quick-checkout')
  }

  // Obtener todas las transacciones completadas (devoluciones)
  const completedTransactions = await prisma.keyTransaction.findMany({
    where: {
      status: 'CHECKED_IN'
    },
    include: {
      user: {
        select: {
          fullName: true,
          licenseLast4: true,
          employeeId: true
        }
      },
      key: {
        include: {
          vehicle: {
            select: {
              unitNumber: true,
              plateNumber: true,
              brand: true,
              model: true
            }
          }
        }
      }
    },
    orderBy: {
      checkinTime: 'desc'
    },
    take: 100 // Últimas 100 transacciones
  })

  // Calcular estadísticas
  const stats = {
    total: completedTransactions.length,
    today: completedTransactions.filter(t => {
      const today = new Date()
      const checkinDate = t.checkinTime ? new Date(t.checkinTime) : null
      return checkinDate && 
        checkinDate.getDate() === today.getDate() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getFullYear() === today.getFullYear()
    }).length,
    thisWeek: completedTransactions.filter(t => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const checkinDate = t.checkinTime ? new Date(t.checkinTime) : null
      return checkinDate && checkinDate >= weekAgo
    }).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Return History</h1>
          <p className="text-gray-600 mt-1">Complete record of all key returns</p>
        </div>
        <Link href="/dashboard/admin">
          <Badge variant="info" className="cursor-pointer">← Back to Panel</Badge>
        </Link>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-3xl font-bold text-primary-600">{stats.today}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-blue-600">{stats.thisWeek}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Recorded</p>
              <p className="text-3xl font-bold text-green-600">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Historial */}
      <Card>
        <CardHeader>
          <CardTitle>All Returns</CardTitle>
        </CardHeader>
        <CardContent>
          {completedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No returns registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Return Date/Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Vehicle</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Key</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Usage Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedTransactions.map((transaction) => {
                    const checkoutTime = new Date(transaction.checkoutTime)
                    const checkinTime = transaction.checkinTime ? new Date(transaction.checkinTime) : null
                    const usageTime = checkinTime 
                      ? Math.round((checkinTime.getTime() - checkoutTime.getTime()) / (1000 * 60 * 60))
                      : 0

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {checkinTime ? checkinTime.toLocaleString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.user.fullName}</p>
                            <p className="text-xs text-gray-500">{transaction.user.licenseLast4 ? `Lic: ${transaction.user.licenseLast4}` : transaction.user.employeeId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.key.vehicle.unitNumber}</p>
                            <p className="text-xs text-gray-500">
                              {transaction.key.vehicle.brand} {transaction.key.vehicle.model}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="default">{transaction.key.keyNumber}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${
                            usageTime > 12 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {usageTime} hrs
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="success">Returned</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
