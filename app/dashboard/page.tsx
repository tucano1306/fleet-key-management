import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { KeyList } from '@/components/key-list'
import { MyTransactions } from '@/components/my-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    return null
  }

  // Get all keys with their current status and vehicle info
  const keys = await prisma.key.findMany({
    include: {
      vehicle: true, // Include vehicle information
      keyTransactions: {
        where: {
          status: 'CHECKED_OUT'
        },
        include: {
          user: {
            select: {
              fullName: true,
              employeeId: true
            }
          }
        }
      }
    },
    orderBy: {
      keyNumber: 'asc'
    }
  })

  // Get user's active transactions
  const myActiveTransactions = await prisma.keyTransaction.findMany({
    where: {
      userId: session.id,
      status: 'CHECKED_OUT'
    },
    include: {
      key: {
        include: {
          vehicle: true // Include vehicle info in user's transactions
        }
      }
    },
    orderBy: {
      checkoutTime: 'desc'
    }
  })

  // Get statistics
  const totalKeys = await prisma.key.count()
  const availableKeys = await prisma.key.count({ where: { status: 'AVAILABLE' } })
  const checkedOutKeys = await prisma.key.count({ where: { status: 'CHECKED_OUT' } })
  const maintenanceKeys = await prisma.key.count({ where: { status: 'MAINTENANCE' } })
  const lostKeys = await prisma.key.count({ where: { status: 'LOST' } })

  return (
    <div className="space-y-6">
      {/* Quick Checkout Banner - SOLO para DRIVER y CLEANING_STAFF */}
      {session.role !== 'DISPATCH' && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Retiro Rápido de Llaves</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ingresa el número de llave y confirma en segundos
                  </p>
                </div>
              </div>
              <Link href="/dashboard/quick-checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white h-12 px-8 text-lg font-semibold shadow-lg">
                  Iniciar Retiro →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalKeys}</p>
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
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{availableKeys}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Prestadas</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{checkedOutKeys}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Mantenimiento</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{maintenanceKeys}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Extraviadas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{lostKeys}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Active Transactions */}
      {myActiveTransactions.length > 0 && (
        <MyTransactions transactions={myActiveTransactions} />
      )}

      {/* All Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Llaves</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyList keys={keys} userId={session.id} userRole={session.role} />
        </CardContent>
      </Card>
    </div>
  )
}
