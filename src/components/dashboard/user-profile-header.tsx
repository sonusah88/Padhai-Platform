'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Flame,
  Star,
  Trophy,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileHeaderProps {
  streak: number;
  xp: number;
  todayXP: number;
  level: number;
  weeklyGoalProgress: number;
}

export function UserProfileHeader({
  streak,
  xp,
  todayXP,
  level,
  weeklyGoalProgress,
}: UserProfileHeaderProps) {
  const router = useRouter();
  const [userName, setUserName] = useState('Aarav Sharma');
  const [userEmail, setUserEmail] = useState('aarav@gmail.com');
  const [userGrade, setUserGrade] = useState('Grade 8');
  const [userSchool, setUserSchool] = useState('Kathmandu');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('padhai_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.full_name) setUserName(parsed.full_name);
          if (parsed.email) setUserEmail(parsed.email);
          if (parsed.grade) setUserGrade(parsed.grade);
          if (parsed.school) setUserSchool(parsed.school);
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
    router.push('/login');
    router.refresh();
  };

  const notifications = [
    { title: 'Tonight\'s Live Class', desc: 'Grade 8 Math starts at 7:00 PM NPT', time: '2h ago', unread: true },
    { title: 'Weekly Tournament', desc: 'Rank #45 in Mathematics Challenge', time: '5h ago', unread: true },
    { title: 'Achievement Unlocked', desc: 'Earned 7-Day Streak Badge 🔥', time: '1d ago', unread: false },
  ];

  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-sm p-4 sm:p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-center gap-4">
          {/* Avatar with Level Badge */}
          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full rounded-[14px] bg-[hsl(var(--card))] flex items-center justify-center font-bold text-xl sm:text-2xl text-[hsl(var(--primary))] font-[var(--font-heading)]">
                {userName.charAt(0)}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[10px] font-extrabold text-white bg-[hsl(var(--primary))] rounded-full border-2 border-[hsl(var(--card))] shadow-xs">
              Lvl {level}
            </span>
          </div>

          {/* Name & Academic info */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                {userName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--success))] bg-[hsl(var(--success-light))] rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[hsl(var(--foreground-secondary))] mt-0.5">
              {userGrade} · {userSchool} · {userEmail}
            </p>
          </div>
        </div>

        {/* Right: Gamification Chips & Essential Action Dropdowns */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[hsl(var(--border))]">
          {/* Streak Chip */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--secondary-light))] border border-[hsl(var(--secondary)/0.15)] text-[hsl(var(--secondary))]"
            title="Daily Learning Streak"
          >
            <Flame className="w-4 h-4 fill-[hsl(var(--secondary))]" />
            <div>
              <p className="text-xs font-bold leading-tight">{streak} Days</p>
              <p className="text-[10px] text-[hsl(var(--foreground-secondary))] leading-tight hidden sm:block">Streak</p>
            </div>
          </div>

          {/* XP Chip */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--level-bg))] border border-[hsl(var(--primary)/0.1)] text-[hsl(var(--foreground))]"
            title="Total XP Points"
          >
            <Star className="w-4 h-4 text-[hsl(var(--xp))] fill-[hsl(var(--xp))]" />
            <div>
              <p className="text-xs font-bold leading-tight">{xp.toLocaleString()} XP</p>
              <p className="text-[10px] text-[hsl(var(--success))] leading-tight hidden sm:block">+{todayXP} today</p>
            </div>
          </div>

          {/* District Rank Chip */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--primary-light))] border border-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
            title="District Tournament Rank"
          >
            <Trophy className="w-4 h-4 text-[hsl(var(--primary))]" />
            <div>
              <p className="text-xs font-bold leading-tight">#45 District</p>
              <p className="text-[10px] text-[hsl(var(--foreground-secondary))] leading-tight">Kathmandu</p>
            </div>
          </div>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
              className="relative p-2.5 text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--background-tertiary))] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[hsl(var(--destructive))]" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-xl py-3 z-[var(--z-popover)] animate-fade-in">
                <div className="px-4 pb-2 border-b border-[hsl(var(--border))] flex items-center justify-between">
                  <span className="text-xs font-bold text-[hsl(var(--foreground))]">Notifications</span>
                  <span className="text-[10px] font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary-light))] px-2 py-0.5 rounded-full">
                    2 New
                  </span>
                </div>
                <div className="divide-y divide-[hsl(var(--border))]">
                  {notifications.map((n, idx) => (
                    <div key={idx} className={cn("p-3 hover:bg-[hsl(var(--muted))] transition-colors", n.unread && "bg-[hsl(var(--primary-light)/0.3)]")}>
                      <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{n.title}</p>
                      <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-0.5">{n.desc}</p>
                      <p className="text-[10px] text-[hsl(var(--foreground-tertiary))] mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-medium text-[hsl(var(--foreground))] rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--background-tertiary))] transition-colors"
            >
              <User className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="hidden sm:inline font-semibold">Account</span>
              <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))]" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-xl py-2 z-[var(--z-popover)] animate-fade-in">
                <div className="px-4 py-2 border-b border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--foreground))] truncate">{userName}</p>
                  <p className="text-[11px] text-[hsl(var(--foreground-tertiary))] truncate">{userEmail}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <User className="w-4 h-4 text-[hsl(var(--primary))]" /> Edit Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[hsl(var(--foreground-secondary))]" /> Settings
                </Link>
                <div className="border-t border-[hsl(var(--border))] my-1" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive-light))] transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
