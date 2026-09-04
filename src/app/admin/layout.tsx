import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminHeader } from '@/components/dashboard/admin-header';

export const metadata = {
  title: 'Padhai Admin & Management Portal',
  description: 'Manage users, host live classes, upload content, and build quizzes.',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let userRole: 'admin' | 'teacher' | 'student' = 'admin';
  let userName = 'Super Admin';

  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        redirect('/login?redirect=/admin');
      }

      // Query profile role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        userRole = profile.role as 'admin' | 'teacher' | 'student';
        userName = profile.full_name || 'Admin';
      }

      // Restrict access to admin, super_admin, and teacher
      if (userRole !== 'admin' && userRole !== 'teacher' && (userRole as string) !== 'super_admin') {
        redirect('/dashboard');
      }
    } catch {
      // Allow demo in development
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex">
      {/* Sidebar Navigation */}
      <AdminSidebar userRole={userRole} userName={userName} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader userName={userName} userRole={userRole} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
