import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, destroySession } from '@/lib/auth'
import { Button } from '@/components/ui/button'

async function logoutAction() {
  'use server'
  await destroySession()
  redirect('/login')
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const isAdmin = session.role === 'DISPATCH'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  KeyFlow
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {isAdmin ? '🎯 Control Center' : '🚗 Driver Panel'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {isAdmin ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="hidden sm:inline text-xs sm:text-sm">Home</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin">
                    <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="hidden sm:inline text-xs sm:text-sm">Admin</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/keys">
                    <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span className="hidden sm:inline text-xs sm:text-sm">Keys</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/drivers">
                    <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="hidden sm:inline text-xs sm:text-sm">Drivers</span>
                    </Button>
                  </Link>
                </>
              ) : null}
              <div className="text-right hidden md:block">
                <p className="text-xs sm:text-sm font-medium text-gray-900">{session.fullName}</p>
                <p className="text-xs text-gray-600">{isAdmin ? 'Dispatch' : 'Driver/Staff'}</p>
              </div>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline text-xs sm:text-sm">Log Out</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </main>
    </div>
  )
}
