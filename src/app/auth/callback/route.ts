// =============================================================================
// Auth Callback — Handles OAuth redirects (Google, etc.)
// =============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (errorParam) {
    const errorUrl = new URL('/auth/error', origin);
    errorUrl.searchParams.set('error', errorParam);
    if (errorDescription) {
      errorUrl.searchParams.set('message', errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?error=missing_code', origin));
  }

  try {
    const supabase = await createClient();

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error.message);
      return NextResponse.redirect(
        new URL(`/auth/error?error=exchange_failed&message=${encodeURIComponent(error.message)}`, origin)
      );
    }

    const user = data.user;

    if (!user) {
      return NextResponse.redirect(new URL('/auth/error?error=no_user', origin));
    }

    // Check if profile exists (created by the database trigger on auth.users INSERT)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Determine redirect based on role
    const role = profile?.role || user.user_metadata?.role || 'student';

    let destination = '/dashboard';
    if (redirectParam) {
      destination = redirectParam;
    } else {
      switch (role) {
        case 'teacher': destination = '/teacher/dashboard'; break;
        case 'parent': destination = '/parent/dashboard'; break;
        case 'admin':
        case 'super_admin': destination = '/admin'; break;
        default: destination = '/dashboard';
      }
    }

    return NextResponse.redirect(new URL(destination, origin));
  } catch (err) {
    console.error('Auth callback unexpected error:', err);
    return NextResponse.redirect(new URL('/auth/error?error=unexpected', origin));
  }
}
