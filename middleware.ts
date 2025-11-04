import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware runs before every request
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/']
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
  
  // Get session cookie
  const session = request.cookies.get('key_mgmt_session')
  
  // Allow root path to redirect naturally
  if (pathname === '/') {
    return NextResponse.next()
  }
  
  // Redirect to login if trying to access protected route without session
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect to dashboard if trying to access login/register with active session
  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/dashboard/quick-checkout', request.url))
  }
  
  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
