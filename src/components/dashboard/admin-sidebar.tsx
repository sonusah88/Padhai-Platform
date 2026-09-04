'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Video,
  FileText,
  HelpCircle,
  GraduationCap,
  ArrowLeft,
  ShieldCheck,
  Film,
  Sparkles,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AdminSidebar({ userRole = 'admin', userName = 'Admin' }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Users & Roles',
      href: '/admin/users',
      icon: Users,
      badge: 'Admin',
    },
    {
      name: 'Live Classes (Zoom)',
      href: '/admin/live-classes',
      icon: Video,
      badge: 'Live',
    },
    {
      name: 'VOD & Study Materials',
      href: '/admin/content',
      icon: Film,
      badge: null,
    },
    {
      name: 'Dynamic Quiz Builder',
      href: '/admin/quizzes',
      icon: HelpCircle,
      badge: 'Interactive',
    },
  ];

  return (
    <aside className="w-64 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand & Portal Badge */}
      <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-base font-[var(--font-heading)]">
            प
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[hsl(var(--foreground))] block leading-none">
              Padhai Admin
            </span>
            <span className="text-[10px] text-[hsl(var(--primary))] font-semibold uppercase tracking-wider">
              Management Portal
            </span>
          </div>
        </Link>
      </div>

      {/* User Card Pill */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-[hsl(var(--muted)/0.6)] border border-[hsl(var(--border))] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-xs shrink-0">
          {userName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[hsl(var(--foreground))] truncate">{userName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-[hsl(var(--primary))] uppercase tracking-wider">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold text-[hsl(var(--foreground-tertiary))] uppercase tracking-wider">
          Management
        </p>

        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-[hsl(var(--foreground-tertiary))] group-hover:text-[hsl(var(--foreground))]')} />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Back Button */}
      <div className="p-3 border-t border-[hsl(var(--border))] space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[hsl(var(--foreground-tertiary))]" />
          <span>Exit to Student App</span>
        </Link>
      </div>
    </aside>
  );
}
