'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  GraduationCap,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { AdminUserItem, UserRole } from '@/lib/types';
import { getUsersListAction, deleteUserAction } from '@/lib/actions/admin';
import { RoleChangeModal } from '@/components/admin/role-change-modal';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUserItem | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsersListAction({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: searchQuery || undefined,
      });
      setUsers(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleUpdated = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleDeleteUser = async (user: AdminUserItem) => {
    if (!confirm(`Are you sure you want to remove ${user.full_name}?`)) return;
    const res = await deleteUserAction(user.id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      alert(res.error || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> Teacher
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <GraduationCap className="w-3 h-3" /> Student
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[hsl(var(--foreground))]">
            User &amp; Role Management
          </h1>
          <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-0.5">
            Manage permissions, promote students to teachers to host live classes, and inspect accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--foreground))]">
            {users.length} Users Listed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[hsl(var(--muted))] rounded-xl overflow-x-auto">
          {['all', 'student', 'teacher', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                roleFilter === role
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              {role === 'all' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-tertiary))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, school..."
              className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-[hsl(var(--primary))] text-white text-xs font-bold hover:bg-[hsl(var(--primary-hover))] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] text-[hsl(var(--foreground-secondary))]">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">School / Institution</th>
                <th className="p-4 font-semibold">XP &amp; Level</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[hsl(var(--foreground-secondary))]">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[hsl(var(--foreground-secondary))]">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                          ) : (
                            u.full_name[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[hsl(var(--foreground))]">{u.full_name}</p>
                          <p className="text-[11px] text-[hsl(var(--foreground-tertiary))]">{u.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">{getRoleBadge(u.role)}</td>

                    {/* School */}
                    <td className="p-4 text-[hsl(var(--foreground-secondary))]">
                      {u.school || u.district || 'Nepal'}
                    </td>

                    {/* XP & Level */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-[hsl(var(--xp))] font-bold">{u.xp} XP</span>
                        <span className="text-[hsl(var(--foreground-tertiary))]">• Lvl {u.level}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUserForRole(u)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary-light))] hover:text-[hsl(var(--primary))] text-[hsl(var(--foreground))] font-semibold text-xs transition-colors"
                          title="Change user role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Change Role</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-[hsl(var(--foreground-tertiary))] hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      <RoleChangeModal
        user={selectedUserForRole}
        isOpen={!!selectedUserForRole}
        onClose={() => setSelectedUserForRole(null)}
        onSuccess={handleRoleUpdated}
      />
    </div>
  );
}
