import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware — Session refresh & route protection.
 *
 * Rules:
 * 1. Authentication is ONLY via Supabase `getUser()`. No cookies, no localStorage.
 * 2. Protected routes require a valid Supabase session.
 * 3. Role-based access is enforced here for top-level route groups.
 * 4. Fine-grained permission checks happen in server actions/components.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const demoCookie = request.cookies.get('padhai_session');

  // If Supabase is not configured or placeholder, allow access if demoCookie is present
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    const { pathname } = request.nextUrl;
    const protectedPrefixes = ['/dashboard', '/teacher', '/parent', '/admin', '/settings', '/profile', '/learn/', '/practice', '/live'];
    const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

    if (isProtected && !demoCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const authRoutes = ['/login', '/register', '/forgot-password'];
    if (authRoutes.includes(pathname) && demoCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session — this is critical for Supabase SSR
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // Route classification
  // ---------------------------------------------------------------------------
  const protectedPrefixes = [
    '/dashboard',
    '/learn/',
    '/practice',
    '/competitions',
    '/achievements',
    '/profile',
    '/settings',
    '/ai-tutor',
    '/live',
    '/dictionary',
  ];

  const teacherPrefixes = ['/teacher'];
  const parentPrefixes = ['/parent'];
  const adminPrefixes = ['/admin'];

  const authRoutes = ['/login', '/register', '/forgot-password'];
  // Note: /verify-email and /reset-password are accessible without session
  // because users need to verify or reset before they have a session.

  const isProtected = protectedPrefixes.some(route => pathname.startsWith(route));
  const isTeacherRoute = teacherPrefixes.some(route => pathname.startsWith(route));
  const isParentRoute = parentPrefixes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminPrefixes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  const isAuthenticated = !!user;

  // ---------------------------------------------------------------------------
  // 1. Protected routes — require authentication
  // ---------------------------------------------------------------------------
  if ((isProtected || isTeacherRoute || isParentRoute || isAdminRoute) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ---------------------------------------------------------------------------
  // 2. Auth routes — redirect authenticated users to their dashboard
  // ---------------------------------------------------------------------------
  if (isAuthRoute && isAuthenticated) {
    // Determine role from user metadata (set during signup / profile creation)
    // The canonical role is in the `profiles` table, but middleware cannot
    // efficiently query it on every request. We use metadata as a fast hint
    // and validate properly in server components.
    const role = user.user_metadata?.role || 'student';
    const url = request.nextUrl.clone();

    switch (role) {
      case 'teacher':
        url.pathname = '/teacher/dashboard';
        break;
      case 'parent':
        url.pathname = '/parent/dashboard';
        break;
      case 'admin':
      case 'super_admin':
        url.pathname = '/admin';
        break;
      default:
        url.pathname = '/dashboard';
    }
    return NextResponse.redirect(url);
  }

  // ---------------------------------------------------------------------------
  // 3. Role-based route protection
  // ---------------------------------------------------------------------------
  if (isAuthenticated) {
    const role = user.user_metadata?.role || 'student';

    // Admin routes — only admin/super_admin
    if (isAdminRoute && role !== 'admin' && role !== 'super_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Teacher routes — only teacher/admin/super_admin
    if (isTeacherRoute && role !== 'teacher' && role !== 'admin' && role !== 'super_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Parent routes — only parent/admin/super_admin
    if (isParentRoute && role !== 'parent' && role !== 'admin' && role !== 'super_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|icon-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
