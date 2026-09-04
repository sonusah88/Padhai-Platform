import Link from 'next/link';
import {
  Users,
  Video,
  Film,
  FileText,
  HelpCircle,
  TrendingUp,
  Radio,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { getAdminStatsAction } from '@/lib/actions/admin';
import { getAdminLiveClassesAction } from '@/lib/actions/live-classes';

export default async function AdminOverviewPage() {
  const stats = await getAdminStatsAction();
  const liveClasses = await getAdminLiveClassesAction();

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      subtitle: `${stats.totalUsers.toLocaleString()} total platform accounts`,
      icon: Users,
      color: 'text-[hsl(var(--primary))]',
      bg: 'bg-[hsl(var(--primary-light))]',
      href: '/admin/users',
    },
    {
      title: 'Active Teachers',
      value: stats.totalTeachers.toString(),
      subtitle: 'Faculty & verified educators',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      href: '/admin/users?role=teacher',
    },
    {
      title: 'Live Zoom Sessions',
      value: stats.totalLiveClasses.toString(),
      subtitle: `${stats.activeLiveNow} class active now`,
      icon: Radio,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
      href: '/admin/live-classes',
    },
    {
      title: 'Recorded VODs',
      value: stats.totalVideos.toString(),
      subtitle: 'On-demand video lectures',
      icon: Film,
      color: 'text-[hsl(var(--secondary))]',
      bg: 'bg-[hsl(var(--secondary-light))]',
      href: '/admin/content?tab=videos',
    },
    {
      title: 'Study Materials',
      value: stats.totalMaterials.toString(),
      subtitle: 'PDFs, worksheets & guides',
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
      href: '/admin/content?tab=materials',
    },
    {
      title: 'Interactive Quizzes',
      value: stats.totalQuizzes.toString(),
      subtitle: 'Assessments & challenge sets',
      icon: HelpCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      href: '/admin/quizzes',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[hsl(var(--primary-light))] via-[hsl(var(--card))] to-[hsl(var(--card))] border border-[hsl(var(--primary)/0.2)] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
            Padhai Education Operations Hub
          </h1>
          <p className="text-xs md:text-sm text-[hsl(var(--foreground-secondary))] max-w-xl">
            Monitor learning metrics, assign teacher privileges, schedule Zoom live classes, and publish curriculum study materials.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/admin/live-classes"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold shadow-sm transition-all"
          >
            <Video className="w-4 h-4" />
            <span>Schedule Zoom Class</span>
          </Link>
          <Link
            href="/admin/content"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs font-bold text-[hsl(var(--foreground))] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Content</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[hsl(var(--foreground-secondary))]">
                    {card.title}
                  </p>
                  <p className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--foreground))] mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[hsl(var(--foreground-tertiary))] truncate">
                  {card.subtitle}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Lower Split: Live Classes & Quick Modules */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Scheduled & Active Live Classes */}
        <div className="lg:col-span-8 bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
                Live Classes Schedule
              </h2>
            </div>
            <Link
              href="/admin/live-classes"
              className="text-xs font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {liveClasses.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {item.subject_id?.includes('sci') ? '🔬' : '📐'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {item.status === 'live' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold animate-pulse">
                          ● LIVE NOW
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground-secondary))] text-[10px] font-semibold">
                          Scheduled
                        </span>
                      )}
                      <span className="text-xs text-[hsl(var(--foreground-tertiary))]">
                        Zoom ID: {item.meeting_id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[hsl(var(--foreground))] truncate mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-0.5">
                      Teacher: {item.teacher?.full_name || 'Faculty Member'} • {item.duration_minutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/live/${item.id}?role=teacher`}
                    className="px-3.5 py-1.5 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Host in Zoom
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-4 bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Admin Shortcuts
          </h2>

          <div className="space-y-2.5">
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span className="text-xs font-bold text-[hsl(var(--foreground))]">Assign Teacher Roles</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))] group-hover:text-[hsl(var(--primary))] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/admin/content?tab=videos"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Film className="w-4 h-4 text-[hsl(var(--secondary))]" />
                <span className="text-xs font-bold text-[hsl(var(--foreground))]">Upload Recorded Lecture</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))] group-hover:text-[hsl(var(--primary))] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/admin/content?tab=materials"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-[hsl(var(--foreground))]">Upload PDF Handouts</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))] group-hover:text-[hsl(var(--primary))] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/admin/quizzes"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-[hsl(var(--foreground))]">Create New Quiz</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))] group-hover:text-[hsl(var(--primary))] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
