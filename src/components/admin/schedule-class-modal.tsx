'use client';

import { useState } from 'react';
import { Video, Calendar, Clock, KeyRound, X, Sparkles, Plus } from 'lucide-react';
import { scheduleLiveClassAction } from '@/lib/actions/live-classes';
import { LiveClassItem } from '@/lib/types';

interface ScheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClass: LiveClassItem) => void;
}

export function ScheduleClassModal({ isOpen, onClose, onSuccess }: ScheduleClassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: '',
    subjectName: 'Mathematics',
    gradeName: 'Grade 10 (SEE)',
    teacherName: 'Ram Sharma',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString().slice(0, 16),
    durationMinutes: 60,
    meetingId: String(Math.floor(10000000000 + Math.random() * 90000000000)),
    passcode: Math.random().toString(36).substring(2, 8),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      setIsSubmitting(true);
      const res = await scheduleLiveClassAction({
        title: formData.title,
        topic: formData.topic || formData.title,
        description: formData.description,
        subjectName: formData.subjectName,
        gradeName: formData.gradeName,
        teacherName: formData.teacherName,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        durationMinutes: Number(formData.durationMinutes),
        meetingId: formData.meetingId,
        passcode: formData.passcode,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        alert(res.error || 'Failed to schedule class');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error scheduling class';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--primary-light))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Schedule Zoom Live Class</h2>
              <p className="text-xs text-[hsl(var(--foreground-secondary))]">
                Generate in-app Zoom meeting parameters and syllabus details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
              Class Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. SEE Mathematics: Trigonometry & Height/Distance Masterclass"
              className="w-full px-3.5 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
                Subject
              </label>
              <select
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              >
                <option value="Mathematics">Mathematics (गणित)</option>
                <option value="Science">Science (विज्ञान)</option>
                <option value="English">English (अंग्रेजी)</option>
                <option value="Nepali">Nepali (नेपाली)</option>
                <option value="Physics">Physics (+2)</option>
                <option value="Chemistry">Chemistry (+2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
                Target Grade
              </label>
              <select
                value={formData.gradeName}
                onChange={(e) => setFormData({ ...formData, gradeName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              >
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10 (SEE)">Grade 10 (SEE)</option>
                <option value="+2 Science">+2 Science</option>
                <option value="+2 Management">+2 Management</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
                Assigned Teacher
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
              Scheduled Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          {/* Zoom Meeting Parameters */}
          <div className="p-3 bg-[hsl(var(--muted)/0.4)] rounded-xl border border-[hsl(var(--border))] space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-[hsl(var(--foreground))] text-[11px]">
              <span className="flex items-center gap-1.5 text-[hsl(var(--primary))]">
                <KeyRound className="w-3.5 h-3.5" />
                Zoom Meeting SDK Config
              </span>
              <span className="text-[10px] text-[hsl(var(--foreground-tertiary))]">In-App Viewport</span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--foreground-tertiary))] block">Meeting ID</span>
                <span className="text-[hsl(var(--foreground))] font-bold">{formData.meetingId}</span>
              </div>
              <div className="p-2 rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--foreground-tertiary))] block">Passcode</span>
                <span className="text-[hsl(var(--foreground))] font-bold">{formData.passcode}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
