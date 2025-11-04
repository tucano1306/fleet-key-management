import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
