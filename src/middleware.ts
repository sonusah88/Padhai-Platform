import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if exists (safely catch errors if Supabase is unconfigured)
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (e) {
    // Ignore error for placeholder/unconfigured Supabase in development
  }

  const { pathname } = request.nextUrl;

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = [
    '/dashboard',
    '/learn/',
    '/practice',
    '/competitions',
    '/achievements',
    '/profile',
    '/settings',
    '/ai-tutor',
    '/teacher',
    '/admin',
    '/parent',
    '/onboarding',
  ];

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (user && pathname.startsWith('/admin')) {
    // Check role from user metadata or profile
    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  if (user && pathname.startsWith('/teacher')) {
    const role = user.user_metadata?.role;
    if (role !== 'teacher' && role !== 'admin' && role !== 'super_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|icon-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
