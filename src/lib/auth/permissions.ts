// =============================================================================
// Permissions — Role-Based Access Control Matrix
// =============================================================================

import type { UserRole } from '@/lib/types';

/**
 * All granular permissions in the system.
 */
export const PERMISSIONS = {
  // Course permissions
  'course:browse': 'Browse published courses',
  'course:create': 'Create new courses',
  'course:edit': 'Edit assigned/owned courses',
  'course:publish': 'Publish courses',
  'course:delete': 'Archive/delete courses',
  'course:manage_all': 'Manage all courses (admin)',

  // Lesson permissions
  'lesson:create': 'Create lessons',
  'lesson:edit': 'Edit lessons',
  'lesson:delete': 'Delete lessons',

  // Live class permissions
  'live:create': 'Schedule live classes',
  'live:host': 'Host/start live classes',
  'live:join': 'Join live classes as participant',

  // Student data permissions
  'student:view_own': 'View own progress and data',
  'student:view_enrolled': 'View enrolled students in own courses',
  'student:view_all': 'View all students (admin)',

  // Assessment permissions
  'assessment:create': 'Create quizzes and assessments',
  'assessment:grade': 'Grade student submissions',
  'assessment:take': 'Take assessments',

  // Announcement permissions
  'announcement:create': 'Create announcements for courses',

  // User management
  'user:manage': 'Manage user accounts',
  'user:manage_roles': 'Change user roles',

  // Teacher management
  'teacher:invite': 'Invite new teachers',
  'teacher:approve': 'Approve teacher accounts',
  'teacher:suspend': 'Suspend teacher accounts',

  // Admin
  'admin:access': 'Access admin dashboard',
  'admin:audit_logs': 'View audit logs',
  'admin:settings': 'Manage platform settings',

  // Parent
  'parent:link_child': 'Link to a student account',
  'parent:view_child': 'View linked child data',

  // Dictionary
  'dictionary:use': 'Use dictionary feature',
  'dictionary:save_words': 'Save words to vocabulary',
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Default permissions for each role.
 * Teachers may have additional granular permissions assigned by admin.
 */
const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  student: [
    'course:browse',
    'live:join',
    'student:view_own',
    'assessment:take',
    'dictionary:use',
    'dictionary:save_words',
  ],

  teacher: [
    'course:browse',
    'course:create',
    'course:edit',
    'lesson:create',
    'lesson:edit',
    'lesson:delete',
    'live:create',
    'live:host',
    'live:join',
    'student:view_enrolled',
    'assessment:create',
    'assessment:grade',
    'announcement:create',
    'dictionary:use',
  ],

  parent: [
    'course:browse',
    'parent:link_child',
    'parent:view_child',
    'dictionary:use',
  ],

  content_manager: [
    'course:browse',
    'course:create',
    'course:edit',
    'course:publish',
    'lesson:create',
    'lesson:edit',
    'lesson:delete',
    'assessment:create',
    'dictionary:use',
  ],

  admin: [
    'course:browse',
    'course:create',
    'course:edit',
    'course:publish',
    'course:delete',
    'course:manage_all',
    'lesson:create',
    'lesson:edit',
    'lesson:delete',
    'live:create',
    'live:host',
    'live:join',
    'student:view_all',
    'assessment:create',
    'assessment:grade',
    'announcement:create',
    'user:manage',
    'user:manage_roles',
    'teacher:invite',
    'teacher:approve',
    'teacher:suspend',
    'admin:access',
    'admin:audit_logs',
    'admin:settings',
    'dictionary:use',
  ],

  super_admin: Object.keys(PERMISSIONS) as unknown as Permission[],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return (perms as readonly string[]).includes(permission);
}

/**
 * Check if a role has ALL of the specified permissions.
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions.
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
