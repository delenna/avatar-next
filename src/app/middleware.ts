import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/app/utils/supabase/middleware'

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
}

export async function middleware(request: NextRequest) {
  console.log('middleware', request)
  // First, let the Supabase middleware handle session management and auth redirects
  const response = await updateSession(request)
  
  // If Supabase middleware returned a response (like a redirect), return it immediately
  if (response) {
    return response
  }

  // At this point, the user is authenticated
  // Redirect away from login page if user is already logged in
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/configuration', request.url))
  }

  // Continue with the request
  return NextResponse.next()
}
