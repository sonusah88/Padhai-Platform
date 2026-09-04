'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  KeyRound,
  X,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateClassModal({ isOpen, onClose, onCreated }: CreateClassModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: '',
    subject: 'Mathematics',
    grade: 'Grade 10',
    teacherName: 'Ram Sharma',
    durationMinutes: '60',
    meetingNumber: String(Math.floor(10000000000 + Math.random() * 90000000000)),
    passcode: Math.random().toString(36).substring(2, 8),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/zoom/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success && data.data?.id) {
        onClose();
        if (onCreated) onCreated();
        // Open the in-app live classroom immediately as Host
        router.push(`/live/${data.data.id}?role=teacher`);
      }
    } catch (err) {
      console.error('Failed to create class:', err);
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
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Host Live Zoom Class</h2>
              <p className="text-xs text-[hsl(var(--foreground-secondary))]">
                Instant in-app classroom with zero redirects
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
              placeholder="e.g. Linear Equations & Algebraic Graphs Mastery"
              className="w-full px-3.5 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              >
                <option value="Mathematics">Mathematics (गणित)</option>
                <option value="Science">Science (विज्ञान)</option>
                <option value="English">English (अंग्रेजी)</option>
                <option value="Nepali">Nepali (नेपाली)</option>
                <option value="Social Studies">Social Studies (सामाजिक)</option>
                <option value="Physics">Physics (+2)</option>
                <option value="Chemistry">Chemistry (+2)</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
                Grade / Class
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              >
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10 (SEE)">Grade 10 (SEE)</option>
                <option value="+2 Science">+2 Science</option>
                <option value="+2 Management">+2 Management</option>
                <option value="All Grades">All Grades Open Session</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
                Teacher Name
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
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            </div>
          </div>

          {/* Zoom Meeting Parameters */}
          <div className="p-3 bg-[hsl(var(--muted)/0.5)] rounded-xl border border-[hsl(var(--border))] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[hsl(var(--foreground))]">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                Auto-Generated Zoom Meeting Room
              </span>
              <span className="text-[10px] text-[hsl(var(--foreground-tertiary))]">Embedded Web SDK</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-[hsl(var(--card))] p-2 rounded border border-[hsl(var(--border))]">
                <span className="text-[hsl(var(--foreground-tertiary))] block text-[10px]">Meeting ID</span>
                <span className="text-[hsl(var(--foreground))] font-bold">{formData.meetingNumber}</span>
              </div>
              <div className="bg-[hsl(var(--card))] p-2 rounded border border-[hsl(var(--border))]">
                <span className="text-[hsl(var(--foreground-tertiary))] block text-[10px]">Passcode</span>
                <span className="text-[hsl(var(--foreground))] font-bold">{formData.passcode}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all shadow-sm disabled:opacity-50"
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Launching...' : 'Start Live Class Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
