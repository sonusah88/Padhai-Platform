'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  BookOpen,
  Video,
  Trophy,
  Brain,
  ChevronDown,
  Wifi,
  WifiOff,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Flame,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBandwidth } from '@/components/providers/bandwidth-provider';

const navItems = [
  { key: 'learn', href: '/courses', icon: BookOpen },
  { key: 'liveClasses', href: '/live', icon: Video },
  { key: 'competitions', href: '/competitions', icon: Trophy },
  { key: 'practice', href: '/practice', icon: Brain },
  { key: 'about', href: '/about', icon: null },
];

export function Header() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const { theme, setTheme } = useTheme();
  const { dataSaver, toggleDataSaver } = useBandwidth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ full_name?: string; email?: string; grade?: string }>({
    full_name: 'Aarav Sharma',
    email: 'aarav@gmail.com',
    grade: 'Grade 8',
  });

  useEffect(() => {
    // Check if session cookie or stored user exists
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes('padhai_session');
    if (hasCookie) {
      setIsLoggedIn(true);
      try {
        const stored = localStorage.getItem('padhai_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(prev => ({ ...prev, ...parsed }));
        }
      } catch {
        // Fallback
      }
    }
  }, []);

  const handleSignOut = () => {
    document.cookie = "padhai_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "padhai_verified=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== 'undefined') {
      localStorage.removeItem('padhai_user');
    }
    setIsLoggedIn(false);
    setProfileDropdownOpen(false);
    router.push('/login');
    router.refresh();
  };

  const userInitial = user.full_name ? user.full_name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] backdrop-blur-xl">
      <div className="container-narrow">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-lg font-[var(--font-heading)]">
              प
            </div>
            <span className="text-xl font-bold font-[var(--font-heading)] text-[hsl(var(--foreground))] hidden sm:block">
              Padhai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.key}
                href={item.href}
                className="px-3.5 py-2 text-sm font-medium text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Data Saver Toggle */}
            <button
              onClick={toggleDataSaver}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full transition-all",
                dataSaver
                  ? "bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))]"
                  : "text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground-secondary))]"
              )}
              title={tCommon('dataSaver')}
              aria-label={`${tCommon('dataSaver')}: ${dataSaver ? 'On' : 'Off'}`}
            >
              {dataSaver ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {dataSaver && <span>Saver</span>}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </button>

            {/* Language */}
            <button
              className="hidden sm:flex items-center gap-1 px-2.5 py-2 text-sm text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label="Change language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">EN</span>
            </button>

            {/* User Profile Icon Dropdown (When Logged In) */}
            {isLoggedIn ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted))] transition-all shadow-xs"
                  aria-label="User Account Menu"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-[hsl(var(--primary))] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {userInitial}
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--foreground))] hidden sm:inline max-w-[100px] truncate">
                    {user.full_name || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))]" />
                </button>

                {/* Account Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-xl py-2 z-[var(--z-popover)] animate-fade-in">
                    {/* User Header */}
                    <div className="px-4 py-2.5 border-b border-[hsl(var(--border))]">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-[hsl(var(--foreground))] truncate">
                          {user.full_name || 'Student'}
                        </p>
                        <ShieldCheck className="w-3.5 h-3.5 text-[hsl(var(--success))]" />
                      </div>
                      <p className="text-[11px] text-[hsl(var(--foreground-tertiary))] truncate">
                        {user.email || 'aarav@gmail.com'}
                      </p>
                    </div>

                    {/* Quick Links */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[hsl(var(--primary))]" />
                        Dashboard
                      </Link>
                      <Link
                        href="/courses"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-[hsl(var(--primary))]" />
                        My Courses
                      </Link>
                      <Link
                        href="/practice"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                      >
                        <Brain className="w-4 h-4 text-[hsl(var(--accent))]" />
                        Practice & Quizzes
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[hsl(var(--foreground-secondary))]" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-[hsl(var(--border))] my-1" />

                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive-light))] transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons (When Not Logged In) */
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  {tCommon('signIn')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] rounded-lg hover:bg-[hsl(var(--primary-hover))] transition-colors shadow-sm"
                >
                  {tCommon('signUp')}
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--muted))]"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[hsl(var(--border))] py-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map(item => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  {item.icon && <item.icon className="w-4.5 h-4.5" />}
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[hsl(var(--border))]">
              <div className="flex items-center justify-between px-3 py-2">
                <button
                  onClick={toggleDataSaver}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    dataSaver ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--foreground-secondary))]"
                  )}
                >
                  {dataSaver ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                  {tCommon('dataSaver')}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-[hsl(var(--foreground-secondary))]">
                  <Globe className="w-4 h-4" />
                  EN / ने
                </button>
              </div>
              {isLoggedIn ? (
                <button
                  onClick={handleSignOut}
                  className="mx-3 px-4 py-2.5 text-center text-sm font-semibold text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.2)] rounded-lg hover:bg-[hsl(var(--destructive-light))] transition-colors"
                >
                  Sign Out ({user.full_name})
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="mx-3 px-4 py-2.5 text-center text-sm font-medium border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    {tCommon('signIn')}
                  </Link>
                  <Link
                    href="/register"
                    className="mx-3 px-4 py-2.5 text-center text-sm font-semibold text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] rounded-lg hover:bg-[hsl(var(--primary-hover))] transition-colors"
                  >
                    {tCommon('signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
