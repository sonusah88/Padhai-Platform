'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Video,
  Clock,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Sparkles,
  Download,
  Share2,
  Shield,
  UserCheck,
  Award,
  ChevronRight,
  Info,
  CheckCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { ZoomEmbeddedMeeting } from '@/components/live/zoom-embedded-meeting';
import { LiveChatPanel } from '@/components/live/live-chat-panel';
import { LiveWhiteboardNotes } from '@/components/live/live-whiteboard-notes';
import { LiveParticipantsPanel } from '@/components/live/live-participants-panel';
import { LiveClassSession, mockLiveSessions } from '@/lib/zoom/session-store';
import { cn } from '@/lib/utils';

export default function LiveClassRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role from URL query ?role=teacher or default to student
  const initialRole = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';
  const [userRole, setUserRole] = useState<'teacher' | 'student'>(initialRole);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'participants' | 'resources'>('chat');
  const [session, setSession] = useState<LiveClassSession | null>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(15 * 60); // 15 mins in class
  const [copiedLink, setCopiedLink] = useState(false);

  // Student details
  const currentStudentName = 'Aarav (Grade 8)';

  // Fetch session data
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/zoom/meetings/${resolvedParams.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSession(data.data);
        } else {
          // fallback to mock
          const fallback = mockLiveSessions.find((s) => s.id === resolvedParams.id) || mockLiveSessions[0];
          setSession(fallback);
        }
      } catch {
        const fallback = mockLiveSessions.find((s) => s.id === resolvedParams.id) || mockLiveSessions[0];
        setSession(fallback);
      }
    }
    loadSession();
  }, [resolvedParams.id]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyInvite = () => {
    const text = `Join live Zoom class: "${session?.title}"\nMeeting ID: ${session?.meetingNumber}\nPasscode: ${session?.passcode}\nLink: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-secondary))]">
            <div className="w-5 h-5 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
            <span>Connecting to live Zoom classroom...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <Header />

      {/* Classroom Top Bar */}
      <div className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-4 py-2.5">
        <div className="container-narrow flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/live"
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground-secondary))] transition-colors shrink-0"
              title="Back to Live Classes Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]">
                  {session.subject} • {session.grade}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {formatTimer(elapsedSeconds)} Live
                </span>
              </div>
              <h1 className="text-sm md:text-base font-bold text-[hsl(var(--foreground))] truncate mt-0.5">
                {session.title}
              </h1>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            {/* Role switcher toggle (Host vs Student) */}
            <div className="flex items-center p-1 bg-[hsl(var(--muted))] rounded-lg text-xs font-semibold">
              <button
                onClick={() => setUserRole('teacher')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all',
                  userRole === 'teacher'
                    ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-xs'
                    : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Host View</span>
              </button>
              <button
                onClick={() => setUserRole('student')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all',
                  userRole === 'student'
                    ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-xs'
                    : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
                )}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Student View</span>
              </button>
            </div>

            {/* Copy Invite / Info */}
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs font-semibold text-[hsl(var(--foreground))] transition-colors"
            >
              {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Invite'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Classroom Split Layout */}
      <main className="flex-1 container-narrow py-4 grid lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Embedded Zoom Meeting Viewport (Zero Redirect) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="w-full aspect-video min-h-[420px] md:min-h-[500px]">
            <ZoomEmbeddedMeeting
              meetingNumber={session.meetingNumber}
              passcode={session.passcode}
              topic={session.topic}
              teacherName={session.teacherName}
              userName={userRole === 'teacher' ? session.teacherName : currentStudentName}
              userRole={userRole}
              onLeave={() => router.push('/live')}
              isHandRaised={isHandRaised}
              onToggleHand={() => setIsHandRaised(!isHandRaised)}
            />
          </div>

          {/* Session Overview & Instructor Info Card */}
          <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={session.teacherAvatar}
                alt={session.teacherName}
                className="w-12 h-12 rounded-xl object-cover border border-[hsl(var(--border))]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">{session.teacherName}</h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]">
                    Host
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--foreground-secondary))]">{session.teacherRole}</p>
                <p className="text-[11px] text-[hsl(var(--foreground-tertiary))] mt-0.5">
                  Zoom ID: <span className="font-mono">{session.meetingNumber}</span> • Pass: <span className="font-mono">{session.passcode}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-2 rounded-lg bg-[hsl(var(--level-bg))] border border-[hsl(var(--border))] text-center">
                <span className="text-[10px] text-[hsl(var(--foreground-tertiary))] block">Attendance</span>
                <span className="text-xs font-bold text-[hsl(var(--xp))]">+50 XP Earned</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-[hsl(var(--muted))] text-center">
                <span className="text-[10px] text-[hsl(var(--foreground-tertiary))] block">Class Size</span>
                <span className="text-xs font-bold text-[hsl(var(--foreground))]">48 Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: In-Class Interactive Side Panels */}
        <div className="lg:col-span-4 flex flex-col h-[580px] md:h-[620px]">
          {/* Side Tabs Header */}
          <div className="flex items-center justify-between p-1 bg-[hsl(var(--muted))] rounded-xl mb-3">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center',
                activeTab === 'chat'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              Chat &amp; Q&amp;A
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center',
                activeTab === 'notes'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              Smart Notes
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center',
                activeTab === 'participants'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              Roster
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center',
                activeTab === 'resources'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              Handouts
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 min-h-0">
            {activeTab === 'chat' && (
              <LiveChatPanel
                currentUserName={userRole === 'teacher' ? session.teacherName : currentStudentName}
                currentUserRole={userRole}
                sessionId={session.id}
              />
            )}

            {activeTab === 'notes' && (
              <LiveWhiteboardNotes
                sessionTitle={session.title}
                subject={session.subject}
              />
            )}

            {activeTab === 'participants' && (
              <LiveParticipantsPanel
                currentUserName={userRole === 'teacher' ? session.teacherName : currentStudentName}
                currentUserRole={userRole}
                teacherName={session.teacherName}
                teacherRole={session.teacherRole}
                teacherAvatar={session.teacherAvatar}
                isHandRaised={isHandRaised}
                onToggleHand={() => setIsHandRaised(!isHandRaised)}
              />
            )}

            {activeTab === 'resources' && (
              <div className="flex flex-col h-full bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[hsl(var(--primary))]" />
                    <h3 className="text-xs font-bold text-[hsl(var(--foreground))]">Class Materials &amp; Downloads</h3>
                  </div>
                  <span className="text-[10px] text-[hsl(var(--foreground-tertiary))]">
                    {session.resources.length} files
                  </span>
                </div>

                <div className="py-3 space-y-2.5">
                  {session.resources.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--muted)/0.7)] border border-[hsl(var(--border))] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[hsl(var(--foreground))] truncate">
                            {res.title}
                          </p>
                          <span className="text-[10px] text-[hsl(var(--foreground-tertiary))]">
                            {res.size || 'PDF'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Downloading "${res.title}"...`)}
                        className="p-2 rounded-lg bg-[hsl(var(--card))] hover:bg-[hsl(var(--primary-light))] hover:text-[hsl(var(--primary))] text-[hsl(var(--foreground-secondary))] border border-[hsl(var(--border))] transition-colors shrink-0"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-auto p-3 rounded-xl bg-[hsl(var(--primary-light))] border border-[hsl(var(--primary)/0.15)] text-xs text-[hsl(var(--foreground))]">
                  <span className="font-semibold text-[hsl(var(--primary))]">Need syllabus help? </span>
                  Ask our AI learning tutor in the practice section for step-by-step guidance.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
