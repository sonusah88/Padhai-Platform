'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import { GoogleOAuthModal } from '@/components/auth/google-oauth-modal';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const redirectTo = searchParams.get('redirect');
  const setupError = searchParams.get('error');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Partial<Record<keyof LoginInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginInput;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === '';

    if (isPlaceholder) {
      document.cookie = "padhai_session=true; path=/; max-age=86400";
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'padhai_user',
          JSON.stringify({
            email,
            full_name: email.split('@')[0] || 'Student',
            role: 'student',
            grade: 'Grade 8',
          })
        );
      }
      router.push(redirectTo || '/dashboard');
      router.refresh();
      return;
    }

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Map Supabase error codes to user-friendly messages
        switch (signInError.message) {
          case 'Invalid login credentials':
            setError('Invalid email or password. Please check your credentials and try again.');
            break;
          case 'Email not confirmed':
            setError('Please verify your email before signing in. Check your inbox for the verification code.');
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            return;
          default:
            setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // Success — get user role for redirect
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || 'student';

      let destination = redirectTo || '/dashboard';
      // Override with role-specific dashboard if no explicit redirect
      if (!redirectTo) {
        switch (role) {
          case 'teacher': destination = '/teacher/dashboard'; break;
          case 'parent': destination = '/parent/dashboard'; break;
          case 'admin':
          case 'super_admin': destination = '/admin'; break;
          default: destination = '/dashboard';
        }
      }

      router.push(destination);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === '';

    if (isPlaceholder) {
      setShowGoogleModal(true);
      return;
    }

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`,
        },
      });

      if (oauthError) {
        setShowGoogleModal(true);
      }
    } catch {
      setShowGoogleModal(true);
    }
  }

  const handleGoogleSuccess = (account: { name: string; email: string }) => {
    document.cookie = "padhai_session=true; path=/; max-age=86400";
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'padhai_user',
        JSON.stringify({
          email: account.email,
          full_name: account.name,
          role: 'student',
          grade: 'Grade 8',
        })
      );
    }
    setShowGoogleModal(false);
    router.push(redirectTo || '/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-lg">
              प
            </div>
            <span className="text-xl font-bold font-[var(--font-heading)] text-[hsl(var(--foreground))]">
              Padhai
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1">
            {t('signInTitle')}
          </h1>
          <p className="text-sm text-[hsl(var(--foreground-secondary))] mb-8">
            {t('signInSubtitle')}
          </p>

          {/* Setup required notice */}
          {setupError === 'setup_required' && (
            <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Supabase not configured</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Set your <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded text-[10px]">.env.local</code> to enable authentication.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[hsl(var(--border))] rounded-xl text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t('google')}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--border))]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[hsl(var(--background))] px-3 text-[hsl(var(--foreground-tertiary))]">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-tertiary))]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                  autoComplete="email"
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1",
                    fieldErrors.email ? "border-red-400 dark:border-red-600" : "border-[hsl(var(--input))]"
                  )}
                  placeholder="you@example.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                  {t('password')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[hsl(var(--primary))] hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-tertiary))]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
                  autoComplete="current-password"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 rounded-xl border bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1",
                    fieldErrors.password ? "border-red-400 dark:border-red-600" : "border-[hsl(var(--input))]"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground))]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] transition-all shadow-sm",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? tCommon('loading') : tCommon('signIn')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[hsl(var(--foreground-secondary))]">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-[hsl(var(--primary))] font-medium hover:underline">
              {tCommon('signUp')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Visual Panel (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-[hsl(var(--primary))] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white font-bold text-3xl mx-auto mb-6">
            प
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Learn. Practice. Compete. Grow.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            From textbook basics to future-ready skills — quality education accessible to every student in Nepal.
          </p>
        </div>
      </div>

      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={handleGoogleSuccess}
        role="student"
      />
    </div>
  );
}
