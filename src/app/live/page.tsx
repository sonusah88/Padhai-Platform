'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video,
  Radio,
  Calendar,
  Clock,
  Users,
  Play,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Shield,
  FileText,
  KeyRound,
  CheckCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CreateClassModal } from '@/components/live/create-class-modal';
import { LiveClassSession, mockLiveSessions } from '@/lib/zoom/session-store';
import { cn } from '@/lib/utils';

export default function LiveClassesHubPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveClassSession[]>(mockLiveSessions);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Quick Join by Meeting ID state
  const [quickMeetingId, setQuickMeetingId] = useState('');
  const [quickPasscode, setQuickPasscode] = useState('');

  // Fetch live sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/zoom/meetings');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSessions(data.data);
      }
    } catch {
      // fallback to mock
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMeetingId.trim()) return;
    // Find matching session or open instant room
    const matching = sessions.find((s) => s.meetingNumber === quickMeetingId.trim());
    if (matching) {
      router.push(`/live/${matching.id}`);
    } else {
      router.push(`/live/1?meetingId=${encodeURIComponent(quickMeetingId)}&passcode=${encodeURIComponent(quickPasscode)}`);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (activeTab !== 'all' && session.status !== activeTab) return false;
    if (selectedSubject !== 'all' && session.subject.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    if (selectedGrade !== 'all' && !session.grade.toLowerCase().includes(selectedGrade.toLowerCase())) return false;
    if (
      searchQuery &&
      !session.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !session.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !session.topic.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const liveNowCount = sessions.filter((s) => s.status === 'live').length;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[hsl(var(--primary-light))] via-[hsl(var(--card))] to-[hsl(var(--background))] border-b border-[hsl(var(--border))] py-10 md:py-14">
        <div className="container-narrow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] text-xs font-bold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                <span>Interactive Live Learning • Zoom Integration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
                Live Classes with Expert Teachers Across Nepal
              </h1>
              <p className="text-sm sm:text-base text-[hsl(var(--foreground-secondary))] leading-relaxed">
                Join real-time classrooms directly in your browser with zero redirects. Ask doubts in live Q&amp;A, practice board questions, and earn attendance XP.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Host a Live Class (Teacher)</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground-tertiary))] justify-center">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zoom SDK Built-in • No App Install Needed</span>
              </div>
            </div>
          </div>

          {/* Quick Join Launcher Bar */}
          <div className="mt-8 p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm">
            <form onSubmit={handleQuickJoin} className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--foreground))] shrink-0">
                <KeyRound className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span>Quick Join by ID:</span>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <input
                  type="text"
                  value={quickMeetingId}
                  onChange={(e) => setQuickMeetingId(e.target.value)}
                  placeholder="Zoom Meeting ID (e.g. 84920481920)"
                  className="w-full px-3.5 py-2 text-xs bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
                <input
                  type="text"
                  value={quickPasscode}
                  onChange={(e) => setQuickPasscode(e.target.value)}
                  placeholder="Passcode (optional)"
                  className="w-full px-3.5 py-2 text-xs bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <button
                type="submit"
                disabled={!quickMeetingId.trim()}
                className="w-full md:w-auto px-5 py-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                Join In-App
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 container-narrow py-8 space-y-6">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[hsl(var(--muted))] rounded-xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'all'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              All Classes ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'live'
                  ? 'bg-[hsl(var(--card))] text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Live Now ({liveNowCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'upcoming'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('ended')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'ended'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              Recordings Archive
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-tertiary))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic or teacher..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>
        </div>

        {/* Subject & Grade Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[hsl(var(--foreground-tertiary))] font-semibold">Subject:</span>
          {['all', 'Mathematics', 'Science', 'English', 'Physics'].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={cn(
                'px-3 py-1 rounded-full border transition-all',
                selectedSubject === subj
                  ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                  : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground-secondary))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
              )}
            >
              {subj === 'all' ? 'All Subjects' : subj}
            </button>
          ))}

          <span className="text-[hsl(var(--foreground-tertiary))] font-semibold ml-3">Grade:</span>
          {['all', 'Grade 8', 'Grade 9', 'Grade 10', '+2'].map((gr) => (
            <button
              key={gr}
              onClick={() => setSelectedGrade(gr)}
              className={cn(
                'px-3 py-1 rounded-full border transition-all',
                selectedGrade === gr
                  ? 'bg-[hsl(var(--secondary))] text-white border-[hsl(var(--secondary))]'
                  : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground-secondary))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
              )}
            >
              {gr === 'all' ? 'All Grades' : gr}
            </button>
          ))}
        </div>

        {/* Session Cards Grid */}
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-3">
            <Video className="w-10 h-10 text-[hsl(var(--foreground-tertiary))] mx-auto" />
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">No live classes match your filters</h3>
            <p className="text-xs text-[hsl(var(--foreground-secondary))]">
              Try resetting your filters or host a new live class.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedSubject('all');
                setSelectedGrade('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-[hsl(var(--primary))] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filteredSessions.map((s) => {
              const isLive = s.status === 'live';
              const isEnded = s.status === 'ended';

              return (
                <div
                  key={s.id}
                  className={cn(
                    'group flex flex-col rounded-2xl p-5 border transition-all shadow-xs hover:shadow-md bg-[hsl(var(--card))]',
                    isLive
                      ? 'border-rose-500/40 bg-gradient-to-br from-[hsl(var(--card))] to-rose-500/5'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'
                  )}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]">
                        {s.subject}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[hsl(var(--muted))] text-[hsl(var(--foreground-secondary))]">
                        {s.grade}
                      </span>
                    </div>

                    {isLive ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        LIVE NOW
                      </span>
                    ) : isEnded ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground-tertiary))] text-xs font-medium">
                        Recording Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-secondary))] font-medium">
                        <Clock className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                        <span>{new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} NPT</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-1.5 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>

                  {/* Teacher & Session Stats */}
                  <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.teacherAvatar}
                        alt={s.teacherName}
                        className="w-8 h-8 rounded-full object-cover border border-[hsl(var(--border))]"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{s.teacherName}</p>
                        <p className="text-[10px] text-[hsl(var(--foreground-tertiary))]">{s.teacherRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--foreground-secondary))]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{s.attendeesCount} attended</span>
                    </div>
                  </div>

                  {/* Card Action Buttons (Direct In-App Launch) */}
                  <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-[hsl(var(--foreground-tertiary))]">
                      Zoom ID: {s.meetingNumber}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/live/${s.id}?role=teacher`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground-secondary))] transition-colors"
                        title="Host class with teacher privileges"
                      >
                        Host
                      </Link>

                      <Link
                        href={`/live/${s.id}`}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg text-white transition-all shadow-xs',
                          isLive
                            ? 'bg-rose-600 hover:bg-rose-500'
                            : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))]'
                        )}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isLive ? 'Join Live Class' : isEnded ? 'Watch Recording' : 'Enter Classroom'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal for creating class */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchSessions}
      />

      <Footer />
    </div>
  );
}
