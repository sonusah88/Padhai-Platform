'use client';

import { useState } from 'react';
import { X, User, Plus, Check, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleAccount {
  name: string;
  email: string;
  avatar?: string;
}

const DEFAULT_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Sonu Sah',
    email: 'sonusah88@gmail.com',
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma.np@gmail.com',
  },
];

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: GoogleAccount) => void;
  role?: 'student' | 'teacher' | 'parent';
}

export function GoogleOAuthModal({
  isOpen,
  onClose,
  onSuccess,
  role = 'student',
}: GoogleOAuthModalProps) {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customError, setCustomError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'handshake' | 'consent' | 'redirecting'>('idle');

  if (!isOpen) return null;

  const handleSelectAccount = (account: GoogleAccount) => {
    setSelectedEmail(account.email);
    setIsAuthenticating(true);
    setAuthStep('handshake');

    setTimeout(() => {
      setAuthStep('consent');
      setTimeout(() => {
        setAuthStep('redirecting');
        setTimeout(() => {
          onSuccess(account);
        }, 700);
      }, 800);
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    if (!customEmail.includes('@') || !customEmail.includes('.')) {
      setCustomError('Please enter a valid Google email address.');
      return;
    }

    const name = customName.trim() || customEmail.split('@')[0];
    const account: GoogleAccount = {
      name,
      email: customEmail.trim(),
    };

    handleSelectAccount(account);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[440px] bg-white dark:bg-[#1f1f1f] text-[#3c4043] dark:text-[#e8eaed] rounded-[24px] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden font-sans transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-200">
              Google Accounts
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isAuthenticating}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {isAuthenticating ? (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {authStep === 'handshake' && 'Connecting to Google OAuth 2.0...'}
                  {authStep === 'consent' && 'Verifying account permissions...'}
                  {authStep === 'redirecting' && 'Signing into Padhai Platform...'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Secure single sign-on with Google Identity Services
                </p>
              </div>
            </div>
          ) : !isCustomMode ? (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-normal text-gray-900 dark:text-white">
                  Choose an account
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  to continue to <strong className="text-gray-800 dark:text-gray-200 font-medium">Padhai Platform</strong>
                </p>
              </div>

              {/* Account list */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border-y border-gray-100 dark:border-gray-800 -mx-6">
                {DEFAULT_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-sm shrink-0 shadow-sm">
                      {acc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {acc.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {acc.email}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Use another account option */}
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Use another Google account
                  </div>
                </button>
              </div>

              {/* Permissions disclaimer */}
              <div className="mt-5 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400">
                To continue, Google will share your name, email address, language preference, and profile picture with Padhai. Before using this app, review Padhai’s{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Terms of Service</span>.
              </div>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-normal text-gray-900 dark:text-white">
                  Sign in with Google
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Enter your Google email to continue
                </p>
              </div>

              {customError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400">
                  {customError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name (optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Ram Bahadur"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Back to accounts
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#181818] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
          <span>English (United States)</span>
          <div className="flex gap-3">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
