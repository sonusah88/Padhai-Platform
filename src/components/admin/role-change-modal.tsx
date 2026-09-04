'use client';

import { useState } from 'react';
import { ShieldCheck, UserCheck, GraduationCap, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdminUserItem, UserRole } from '@/lib/types';
import { updateUserRoleAction } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';

interface RoleChangeModalProps {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUserId: string, newRole: UserRole) => void;
}

export function RoleChangeModal({ user, isOpen, onClose, onSuccess }: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !user) return null;

  const roleOptions: { role: UserRole; title: string; desc: string; icon: typeof UserCheck }[] = [
    {
      role: 'student',
      title: 'Student',
      desc: 'Can enroll in courses, attend live Zoom classes, submit quizzes, and earn XP.',
      icon: GraduationCap,
    },
    {
      role: 'teacher',
      title: 'Teacher / Faculty',
      desc: 'Can host Zoom live classes, upload recorded lectures, publish study materials & build quizzes.',
      icon: ShieldCheck,
    },
    {
      role: 'content_manager',
      title: 'Content Manager',
      desc: 'Can create and review curriculum materials and quizzes.',
      icon: UserCheck,
    },
    {
      role: 'admin',
      title: 'Administrator',
      desc: 'Full platform management permissions including user role assignment and system settings.',
      icon: ShieldCheck,
    },
  ];

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      const res = await updateUserRoleAction(user.id, selectedRole);

      if (res.success) {
        setStatusMessage({ type: 'success', text: `Role updated to ${selectedRole} successfully!` });
        setTimeout(() => {
          onSuccess(user.id, selectedRole);
          onClose();
        }, 800);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to update role' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating role';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-sm">
              {user.full_name[0]}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[hsl(var(--foreground))]">Assign User Role</h2>
              <p className="text-xs text-[hsl(var(--foreground-secondary))]">{user.full_name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.role;

              return (
                <div
                  key={opt.role}
                  onClick={() => setSelectedRole(opt.role)}
                  className={cn(
                    'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3',
                    isSelected
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary-light))] shadow-xs'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      isSelected
                        ? 'bg-[hsl(var(--primary))] text-white'
                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground-secondary))]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[hsl(var(--foreground))]">{opt.title}</p>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[hsl(var(--foreground-secondary))] mt-0.5 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {statusMessage && (
            <div
              className={cn(
                'p-3 rounded-xl text-xs flex items-center gap-2',
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              )}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
