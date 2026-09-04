'use client';

import { useState } from 'react';
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Sparkles,
  ShieldCheck,
  Search,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  xpEarned?: number;
}

interface LiveParticipantsPanelProps {
  currentUserName: string;
  currentUserRole: 'teacher' | 'student';
  teacherName: string;
  teacherRole: string;
  teacherAvatar: string;
  isHandRaised: boolean;
  onToggleHand: () => void;
}

export function LiveParticipantsPanel({
  currentUserName,
  currentUserRole,
  teacherName,
  teacherRole,
  teacherAvatar,
  isHandRaised,
  onToggleHand,
}: LiveParticipantsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'p1',
      name: teacherName,
      role: 'teacher',
      avatar: teacherAvatar,
      isMuted: false,
      isVideoOn: true,
      isHandRaised: false,
    },
    {
      id: 'p2',
      name: currentUserName,
      role: currentUserRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      isMuted: true,
      isVideoOn: false,
      isHandRaised: isHandRaised,
      xpEarned: 50,
    },
    {
      id: 'p3',
      name: 'Pooja Karki',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      isMuted: true,
      isVideoOn: true,
      isHandRaised: false,
      xpEarned: 50,
    },
    {
      id: 'p4',
      name: 'Bikash Thapa',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250',
      isMuted: true,
      isVideoOn: false,
      isHandRaised: true,
      xpEarned: 50,
    },
    {
      id: 'p5',
      name: 'Anjali Sharma',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
      isMuted: true,
      isVideoOn: false,
      isHandRaised: false,
      xpEarned: 50,
    },
    {
      id: 'p6',
      name: 'Kiran Maharjan',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      isMuted: true,
      isVideoOn: true,
      isHandRaised: false,
      xpEarned: 50,
    },
  ]);

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
            Class Roster ({participants.length} Active)
          </span>
        </div>

        {currentUserRole === 'student' && (
          <button
            onClick={onToggleHand}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
              isHandRaised
                ? 'bg-amber-500 text-white animate-bounce'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.8)]'
            )}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
          </button>
        )}
      </div>

      {/* Attendance XP Banner */}
      <div className="p-2.5 bg-[hsl(var(--level-bg))] border-b border-[hsl(var(--border))] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[hsl(var(--xp))]" />
          <span className="text-xs font-medium text-[hsl(var(--foreground))]">
            Live Attendance XP: <strong className="text-[hsl(var(--primary))]">+50 XP</strong>
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
          Recorded
        </span>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-tertiary))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students in class..."
            className="w-full pl-8 pr-3 py-1.5 bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-lg text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.map((p) => {
          const isTeacher = p.role === 'teacher';
          const isSelf = p.name === currentUserName;

          return (
            <div
              key={p.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg text-xs transition-colors',
                isTeacher
                  ? 'bg-[hsl(var(--primary-light))] border border-[hsl(var(--primary)/0.15)]'
                  : isSelf
                  ? 'bg-[hsl(var(--muted))] font-medium'
                  : 'hover:bg-[hsl(var(--muted)/0.5)]'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[hsl(var(--primary)/0.2)] shrink-0 flex items-center justify-center font-bold text-xs">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.name[0]
                  )}
                  {p.isHandRaised && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px]">
                      ✋
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-[hsl(var(--foreground))] truncate">
                      {p.name} {isSelf && '(You)'}
                    </span>
                    {isTeacher && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[hsl(var(--primary))] text-white">
                        <ShieldCheck className="w-2.5 h-2.5" /> Host
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[hsl(var(--foreground-secondary))] truncate">
                    {isTeacher ? teacherRole : 'Student'}
                  </p>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1 text-[hsl(var(--foreground-tertiary))]">
                {p.isVideoOn ? (
                  <Video className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <VideoOff className="w-3.5 h-3.5 text-[hsl(var(--foreground-tertiary))]" />
                )}
                {p.isMuted ? (
                  <MicOff className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
