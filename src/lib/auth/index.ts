// =============================================================================
// Auth Utilities — Server-side only
// Used in Server Components, Server Actions, and Route Handlers
// =============================================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

/**
 * Role-based dashboard paths.
 * After login, users are redirected to their role-specific area.
 */
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  student: '/dashboard',
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard',
  content_manager: '/dashboard',
  admin: '/admin',
  super_admin: '/admin',
};

export const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'] as const;

export const PUBLIC_ROUTES = ['/', '/about', '/courses'] as const;

/**
 * Get the current authenticated user with their profile.
 * Returns null if not authenticated. Does NOT redirect.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch profile from database (the source of truth for role)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    emailConfirmedAt: user.email_confirmed_at,
    profile,
    role: (profile?.role as UserRole) || 'student',
  };
}

/**
 * Require authentication. Redirects to /login if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Require a specific role (or set of roles).
 * Redirects to the user's own dashboard if they don't have the required role.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's actual dashboard, not the one they were trying to access
    const dashboard = ROLE_DASHBOARDS[user.role] || '/dashboard';
    redirect(dashboard);
  }

  return user;
}

/**
 * Get the correct dashboard path for a user's role.
 */
export function getDashboardForRole(role: UserRole): string {
  return ROLE_DASHBOARDS[role] || '/dashboard';
}

/**
 * Check if a user's email is verified.
 */
export function isEmailVerified(user: Awaited<ReturnType<typeof getUser>>): boolean {
  if (!user) return false;
  return !!user.emailConfirmedAt;
}
