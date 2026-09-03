'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Video,
  BookOpen,
  Zap,
  Trophy,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Flame,
  Star,
  Clock,
  Target,
  Brain,
  AlertTriangle,
  Play,
  CheckCircle2,
  Award,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';

// Demo data — in production this comes from API/database
const demoData = {
  name: 'Aarav',
  grade: 'Grade 8',
  school: 'Kathmandu',
  xp: 1250,
  level: 8,
  streak: 12,
  longestStreak: 18,
  weeklyGoalProgress: 72,
  todayXP: 45,
  upcomingClass: {
    subject: 'Mathematics',
    topic: 'Linear Equations — Solving for x',
    teacher: 'Ram Sharma',
    time: '7:00 PM',
    date: 'Tonight',
  },
  continueLearning: {
    course: 'Grade 8 Mathematics',
    lesson: 'Linear Equations',
    chapter: 'Algebra',
    progress: 65,
  },
  dailyChallenge: {
    questions: 10,
    minutes: 8,
    subject: 'Mathematics',
    completed: false,
  },
  subjectProgress: [
    { name: 'Mathematics', nameNe: 'गणित', progress: 68, trend: 12, icon: '📐', color: 'hsl(var(--primary))' },
    { name: 'Science', nameNe: 'विज्ञान', progress: 55, trend: 8, icon: '🔬', color: 'hsl(var(--accent))' },
    { name: 'English', nameNe: 'अंग्रेजी', progress: 42, trend: 5, icon: '📝', color: 'hsl(var(--secondary))' },
    { name: 'Nepali', nameNe: 'नेपाली', progress: 60, trend: 3, icon: '📖', color: 'hsl(152, 60%, 40%)' },
    { name: 'Social Studies', nameNe: 'सामाजिक', progress: 48, trend: 7, icon: '🌍', color: 'hsl(280, 50%, 50%)' },
  ],
  weakAreas: [
    { concept: 'Fractions', subject: 'Mathematics' },
    { concept: 'Grammar — Tenses', subject: 'English' },
    { concept: 'Electricity', subject: 'Science' },
  ],
  activeCompetition: {
    title: 'Mathematics Weekly Challenge',
    participants: 234,
    endsIn: '2 days',
    rank: 45,
  },
  achievements: [
    { name: 'First Quiz', icon: '🎯', date: '2 days ago' },
    { name: '7-Day Streak', icon: '🔥', date: '5 days ago' },
    { name: 'Math Champion', icon: '🏆', date: '1 week ago' },
  ],
  dailyMission: {
    tasks: [
      { label: '15 min Math', completed: true },
      { label: '10 min English', completed: true },
      { label: '1 Challenge', completed: false },
      { label: 'Attend tonight\'s class', completed: false },
    ],
    progress: 50,
  },
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const d = demoData;

  const timeOfDay = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 17) return t('greetingAfternoon');
    return t('greetingEvening');
  })();

  return (
    <>
      <Header />
      <main className="container-narrow py-6 pb-24 lg:pb-6">
        {/* Greeting + Weekly Goal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">
              {t('greeting', { timeOfDay, name: d.name })}
            </h1>
            <p className="text-sm text-[hsl(var(--foreground-secondary))] mt-0.5">
              {t('weeklyGoalProgress', { percent: d.weeklyGoalProgress })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--secondary-light))] text-[hsl(var(--secondary))]">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-semibold">{d.streak}</span>
              <span className="text-xs hidden sm:inline">day streak</span>
            </div>
            {/* XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--level-bg))]">
              <Star className="w-4 h-4 text-[hsl(var(--xp))] fill-[hsl(var(--xp))]" />
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">+{d.todayXP}</span>
              <span className="text-xs text-[hsl(var(--foreground-secondary))] hidden sm:inline">today</span>
            </div>
            {/* Weekly progress ring */}
            <div className="relative w-11 h-11">
              <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
                <circle
                  cx="22" cy="22" r="18" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="3.5"
                  strokeDasharray={`${(d.weeklyGoalProgress / 100) * 113.1} 113.1`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[hsl(var(--primary))]">
                {d.weeklyGoalProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Column 1+2 — Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Tonight's Live Class */}
            <div className="bg-[hsl(var(--primary-light))] rounded-xl p-5 border border-[hsl(var(--primary)/0.12)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.15)] flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wider">
                      {d.upcomingClass.date} · {d.upcomingClass.time} NPT
                    </p>
                    <h2 className="text-base font-semibold text-[hsl(var(--foreground))] mt-0.5">
                      {d.upcomingClass.subject} — {d.upcomingClass.topic}
                    </h2>
                    <p className="text-sm text-[hsl(var(--foreground-secondary))] mt-0.5">
                      {d.upcomingClass.teacher}
                    </p>
                  </div>
                </div>
                <Link
                  href="/live/1"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[hsl(var(--primary))] rounded-lg hover:bg-[hsl(var(--primary-hover))] transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Join
                </Link>
              </div>
            </div>

            {/* Continue Learning */}
            <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  {t('continueLearning')}
                </h3>
                <Link href="/courses" className="text-xs text-[hsl(var(--primary))] hover:underline">
                  View all
                </Link>
              </div>
              <Link
                href="/learn/grade-8-mathematics/linear-equations"
                className="flex items-center gap-4 p-3.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors -mx-1"
              >
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--primary-light))] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{d.continueLearning.lesson}</p>
                  <p className="text-xs text-[hsl(var(--foreground-secondary))]">
                    {d.continueLearning.course} · {d.continueLearning.chapter}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <div className="w-16 h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--primary))]"
                      style={{ width: `${d.continueLearning.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[hsl(var(--foreground-secondary))]">{d.continueLearning.progress}%</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--foreground-tertiary))]" />
              </Link>
            </div>

            {/* Daily Challenge */}
            <Link
              href="/practice/daily"
              className="block bg-[hsl(var(--secondary-light))] rounded-xl p-5 border border-[hsl(var(--secondary)/0.12)] hover:border-[hsl(var(--secondary)/0.25)] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--secondary)/0.15)] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[hsl(var(--secondary))]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">{t('todayChallenge')}</h3>
                  <p className="text-sm text-[hsl(var(--foreground-secondary))]">
                    {d.dailyChallenge.questions} questions · {d.dailyChallenge.minutes} min · {d.dailyChallenge.subject}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[hsl(var(--secondary))]" />
              </div>
            </Link>

            {/* Subject Progress */}
            <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{t('yourProgress')}</h3>
                <Link href="/profile" className="text-xs text-[hsl(var(--primary))] hover:underline">
                  Details
                </Link>
              </div>
              <div className="space-y-3">
                {d.subjectProgress.map(subj => (
                  <div key={subj.name} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center">{subj.icon}</span>
                    <span className="text-sm text-[hsl(var(--foreground-secondary))] w-28 shrink-0 truncate">{subj.name}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${subj.progress}%`, backgroundColor: subj.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[hsl(var(--success))] w-10 text-right">
                      +{subj.trend}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{t('needsAttention')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {d.weakAreas.map((area, i) => (
                  <Link
                    key={i}
                    href={`/practice?concept=${area.concept}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--warning-light))] border border-[hsl(var(--warning)/0.12)] text-sm text-[hsl(var(--foreground))] hover:border-[hsl(var(--warning)/0.25)] transition-colors"
                  >
                    <Target className="w-3.5 h-3.5 text-[hsl(var(--warning))]" />
                    <span className="font-medium">{area.concept}</span>
                    <span className="text-xs text-[hsl(var(--foreground-tertiary))]">{area.subject}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3 — Sidebar */}
          <div className="space-y-5">

            {/* Daily Mission */}
            <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Your learning mission</h3>
              <div className="space-y-2 mb-4">
                {d.dailyMission.tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[hsl(var(--border))] shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm",
                      task.completed
                        ? "text-[hsl(var(--foreground-tertiary))] line-through"
                        : "text-[hsl(var(--foreground))]"
                    )}>
                      {task.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-2.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"
                  style={{ width: `${d.dailyMission.progress}%` }}
                />
              </div>
              <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-1.5">{d.dailyMission.progress}% complete</p>
            </div>

            {/* Active Competition */}
            <Link
              href="/competitions/1"
              className="block bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-[hsl(var(--xp))]" />
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Active Competition</h3>
              </div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{d.activeCompetition.title}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-[hsl(var(--foreground-secondary))]">
                <span>{d.activeCompetition.participants} students</span>
                <span>Rank #{d.activeCompetition.rank}</span>
                <span>Ends in {d.activeCompetition.endsIn}</span>
              </div>
            </Link>

            {/* AI Tutor Quick */}
            <Link
              href="/ai-tutor"
              className="block bg-gradient-to-br from-[hsl(var(--primary-light))] to-[hsl(var(--accent-light))] rounded-xl p-5 border border-[hsl(var(--primary)/0.1)] hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-[hsl(var(--primary))]" />
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">AI Tutor</h3>
              </div>
              <p className="text-sm text-[hsl(var(--foreground-secondary))]">
                Stuck on something? Ask your AI tutor for help.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))]">
                Start chatting <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* Recent Achievements */}
            <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[hsl(var(--xp))]" />
                  <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{t('achievements')}</h3>
                </div>
                <Link href="/achievements" className="text-xs text-[hsl(var(--primary))] hover:underline">
                  All
                </Link>
              </div>
              <div className="space-y-2.5">
                {d.achievements.map((ach, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-lg">{ach.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{ach.name}</p>
                      <p className="text-xs text-[hsl(var(--foreground-tertiary))]">{ach.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: BookOpen, label: 'Courses', href: '/courses', color: 'primary' },
                { icon: BarChart3, label: 'Practice', href: '/practice', color: 'accent' },
                { icon: Trophy, label: 'Compete', href: '/competitions', color: 'secondary' },
                { icon: Clock, label: 'Schedule', href: '/live', color: 'primary' },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] transition-all text-center"
                >
                  <action.icon className={cn(
                    "w-5 h-5",
                    action.color === 'primary' ? "text-[hsl(var(--primary))]" :
                    action.color === 'accent' ? "text-[hsl(var(--accent))]" :
                    "text-[hsl(var(--secondary))]"
                  )} />
                  <span className="text-xs font-medium text-[hsl(var(--foreground-secondary))]">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[hsl(var(--background)/0.95)] backdrop-blur-lg border-t border-[hsl(var(--border))] z-[var(--z-fixed)] px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: BarChart3, label: 'Dashboard', href: '/dashboard', active: true },
            { icon: BookOpen, label: 'Learn', href: '/courses', active: false },
            { icon: Video, label: 'Live', href: '/live', active: false },
            { icon: Trophy, label: 'Compete', href: '/competitions', active: false },
            { icon: Brain, label: 'AI Tutor', href: '/ai-tutor', active: false },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                item.active
                  ? "text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground-secondary))]"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
