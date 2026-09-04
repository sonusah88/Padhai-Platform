'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Radio,
  Clock,
  Calendar,
  Plus,
  Play,
  Trash2,
  Share2,
  CheckCircle2,
  ExternalLink,
  Shield,
  Search,
} from 'lucide-react';
import { LiveClassItem } from '@/lib/types';
import {
  getAdminLiveClassesAction,
  updateLiveClassStatusAction,
  deleteLiveClassAction,
} from '@/lib/actions/live-classes';
import { ScheduleClassModal } from '@/components/admin/schedule-class-modal';
import { cn } from '@/lib/utils';

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getAdminLiveClassesAction();
      setClasses(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleStatusChange = async (classId: string, newStatus: 'scheduled' | 'live' | 'ended' | 'cancelled') => {
    const res = await updateLiveClassStatusAction(classId, newStatus);
    if (res.success) {
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, status: newStatus } : c))
      );
    } else {
      alert(res.error || 'Failed to update status');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to cancel and delete this class?')) return;
    const res = await deleteLiveClassAction(classId);
    if (res.success) {
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    } else {
      alert(res.error || 'Failed to delete class');
    }
  };

  const filtered = classes.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (
      searchQuery &&
      !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.teacher?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Schedule CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[hsl(var(--foreground))]">
            Live Classes &amp; Zoom Management
          </h1>
          <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-0.5">
            Create, schedule, and host interactive Zoom sessions directly in the built-in web viewport.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Zoom Class</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-[hsl(var(--muted))] rounded-xl overflow-x-auto">
          {['all', 'live', 'scheduled', 'ended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                statusFilter === st
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              {st === 'all' ? 'All Classes' : st === 'live' ? '🔴 Live Now' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-tertiary))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search class or instructor..."
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-[hsl(var(--foreground-secondary))]">
            Loading scheduled sessions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground-secondary))] space-y-2">
            <Video className="w-8 h-8 text-[hsl(var(--foreground-tertiary))] mx-auto" />
            <p className="font-semibold text-sm text-[hsl(var(--foreground))]">No live classes found</p>
            <p>Schedule your first live Zoom session using the button above.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isLive = item.status === 'live';
            return (
              <div
                key={item.id}
                className={cn(
                  'p-5 rounded-2xl bg-[hsl(var(--card))] border transition-all shadow-xs flex flex-col justify-between',
                  isLive
                    ? 'border-rose-500/40 bg-gradient-to-br from-[hsl(var(--card))] to-rose-500/5'
                    : 'border-[hsl(var(--border))]'
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]">
                        Grade 10 • Math
                      </span>
                    </div>

                    {isLive ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        LIVE NOW
                      </span>
                    ) : item.status === 'ended' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground-tertiary))] text-[10px] font-semibold">
                        Ended
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-secondary))]">
                        <Clock className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                        <span>{new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} NPT</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[hsl(var(--foreground))] line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-1 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-4 p-2.5 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[hsl(var(--foreground-tertiary))] block">Zoom Meeting ID</span>
                      <span className="font-bold text-[hsl(var(--foreground))]">{item.meeting_id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[hsl(var(--foreground-tertiary))] block">Passcode</span>
                      <span className="font-bold text-[hsl(var(--foreground))]">{item.passcode}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as 'scheduled' | 'live' | 'ended' | 'cancelled')}
                      className="px-2 py-1 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg text-[11px] font-semibold text-[hsl(var(--foreground))]"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live Now</option>
                      <option value="ended">Ended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => handleDeleteClass(item.id)}
                      className="p-1.5 rounded-lg text-[hsl(var(--foreground-tertiary))] hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Launch Host in-app */}
                  <Link
                    href={`/live/${item.id}?role=teacher`}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs',
                      isLive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))]'
                    )}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isLive ? 'Join as Host' : 'Start Live Class'}</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleClassModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={(newClass) => setClasses([newClass, ...classes])}
      />
    </div>
  );
}
