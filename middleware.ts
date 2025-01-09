import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle both development stacks
  if (process.env.NODE_ENV === 'development') {
    // For webpack stack traces
    if (request.url.includes('__nextjs_original-stack-frame')) {
      const response = NextResponse.next()
      response.headers.set('Connection', 'close')
      return response
    }
    
    // For turbopack stack traces
    if (request.url.includes('__turbopack')) {
      const response = NextResponse.next()
      response.headers.set('Connection', 'keep-alive')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Add turbopack-specific patterns
    '/((?!api|_next/static|_next/image|favicon.ico|__turbopack).*)',
  ],
} 