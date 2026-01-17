import { NextResponse, type NextRequest } from 'next/server'
// import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = request.nextUrl.pathname

  // Redirect old routes to new dashboard routes
  // Eski URL'leri yeni URL'lere yönlendir
  const oldRoutes = [
    '/needy',
    '/aids',
    '/applications',
    '/calendar',
    '/donations',
    '/events',
    '/finance',
    '/messages',
    '/orphans',
    '/purchase',
    '/reports',
    '/settings',
    '/volunteers',
    '/account',
  ]

  // Check if pathname starts with any old route
  for (const route of oldRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      // Redirect to new route
      const newPath = pathname.replace(route, `/dashboard${route}`)
      url.pathname = newPath
      return NextResponse.redirect(url, 301)
    }
  }

  // Geçici olarak auth kontrolünü devre dışı bıraktık
  // return await updateSession(request)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
