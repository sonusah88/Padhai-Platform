'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'unknown';
  const message = searchParams.get('message');

  const errorMessages: Record<string, { title: string; description: string }> = {
    missing_code: {
      title: 'Authentication failed',
      description: 'No authorization code was received. Please try signing in again.',
    },
    exchange_failed: {
      title: 'Sign-in failed',
      description: message || 'Could not complete the authentication. Please try again.',
    },
    no_user: {
      title: 'Account not found',
      description: 'We could not find your account. Please register first.',
    },
    unexpected: {
      title: 'Something went wrong',
      description: 'An unexpected error occurred during authentication. Please try again.',
    },
    setup_required: {
      title: 'Setup required',
      description: 'The authentication system is not configured yet. Please contact an administrator.',
    },
    unknown: {
      title: 'Authentication error',
      description: message || 'An error occurred during authentication. Please try again.',
    },
  };

  const errorInfo = errorMessages[error] || errorMessages.unknown;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
          {errorInfo.title}
        </h1>
        <p className="text-sm text-[hsl(var(--foreground-secondary))] mb-8">
          {errorInfo.description}
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] transition-colors"
          >
            Try signing in again
          </Link>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[hsl(var(--foreground-secondary))]">Loading...</p>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
