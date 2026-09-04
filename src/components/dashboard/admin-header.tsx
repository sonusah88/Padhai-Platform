'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface AdminHeaderProps {
  userName?: string;
  userRole?: string;
}

export function AdminHeader({
  userName = 'Admin',
  userRole = 'admin',
}: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Compute breadcrumb title from path
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Overview & Analytics';
    if (pathname.includes('/admin/users')) return 'User & Role Management';
    if (pathname.includes('/admin/live-classes')) return 'Live Classes (Zoom)';
    if (pathname.includes('/admin/content')) return 'VOD & Study Materials';
    if (pathname.includes('/admin/quizzes')) return 'Dynamic Quiz Builder';
    return 'Admin Panel';
  };

  const handleSignOut = () => {
    document.cookie = "padhai_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== 'undefined') {
      localStorage.removeItem('padhai_user');
    }
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.8)] backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[hsl(var(--foreground-tertiary))] font-medium">Portal</span>
        <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))]" />
        <h1 className="font-bold text-sm text-[hsl(var(--foreground))]">{getPageTitle()}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--primary-light))] border border-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">{userRole}</span>
        </div>

        {/* Live Student Site Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          title="Open student site in new tab"
        >
          <span>View Site</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))] transition-colors"
          title="Toggle Theme"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
