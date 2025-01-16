import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')
  const isAuthPage = request.nextUrl.pathname === '/login' || 
                    request.nextUrl.pathname === '/register'

  if (!authToken && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('unauthorized', 'true')
    return NextResponse.redirect(url)
  }

  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

