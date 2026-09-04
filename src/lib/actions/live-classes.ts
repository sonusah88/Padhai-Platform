'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { LiveClassItem } from '@/lib/types';
import { getAllLiveSessions, createNewLiveSession, updateLiveSession } from '@/lib/zoom/session-store';

let mockAdminLiveClasses: LiveClassItem[] = [
  {
    id: '1',
    title: 'Linear Equations — Solving for x & Graphical Representation',
    topic: 'Algebra & Linear Equations',
    description: 'Master solving multi-step linear equations and algebraic graphs intuitively.',
    subject_id: 'subj-math',
    grade_id: 'grd-8',
    teacher_id: 'usr-2',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    duration_minutes: 60,
    meeting_id: '84920481920',
    passcode: 'padhai123',
    status: 'live',
    recording_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    teacher: {
      id: 'usr-2',
      user_id: 'auth-2',
      full_name: 'Ram Sharma',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: 'teacher',
      grade_id: null,
      school: 'Senior Math Faculty',
      district: 'Kathmandu',
      xp: 4500,
      level: 25,
      streak_current: 12,
      streak_longest: 20,
      streak_last_date: null,
      streak_freeze_remaining: 2,
      settings: {
        locale: 'en',
        theme: 'system',
        data_saver: false,
        notifications_email: true,
        notifications_push: true,
        daily_goal_minutes: 30,
        privacy_show_profile: true,
        privacy_show_leaderboard: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    title: 'Optics: Refraction of Light & Snell\'s Law Mastery',
    topic: 'Light & Optics',
    description: 'Breakdown of refraction, Snell\'s law, and convex/concave lens ray diagrams.',
    subject_id: 'subj-sci',
    grade_id: 'grd-10',
    teacher_id: 'usr-3',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    duration_minutes: 75,
    meeting_id: '92837482910',
    passcode: 'optics2026',
    status: 'scheduled',
    recording_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    teacher: {
      id: 'usr-3',
      user_id: 'auth-3',
      full_name: 'Dr. Sita Adhikari',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      role: 'teacher',
      grade_id: null,
      school: 'Physics Specialist',
      district: 'Lalitpur',
      xp: 6200,
      level: 30,
      streak_current: 18,
      streak_longest: 30,
      streak_last_date: null,
      streak_freeze_remaining: 2,
      settings: {
        locale: 'en',
        theme: 'system',
        data_saver: false,
        notifications_email: true,
        notifications_push: true,
        daily_goal_minutes: 30,
        privacy_show_profile: true,
        privacy_show_leaderboard: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export async function getAdminLiveClassesAction(): Promise<LiveClassItem[]> {
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('live_classes')
        .select('*, teacher:profiles(*), subject:subjects(*), grade:grades(*)')
        .order('scheduled_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as LiveClassItem[];
      }
    } catch {
      // Fallback
    }
  }

  return mockAdminLiveClasses;
}

export async function scheduleLiveClassAction(formData: {
  title: string;
  topic?: string;
  description?: string;
  subjectName?: string;
  gradeName?: string;
  teacherName?: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingId?: string;
  passcode?: string;
}): Promise<{ success: boolean; data?: LiveClassItem; error?: string }> {
  try {
    const meetingId = formData.meetingId || String(Math.floor(10000000000 + Math.random() * 90000000000));
    const passcode = formData.passcode || Math.random().toString(36).substring(2, 8);
    const newId = `live-${Date.now()}`;

    const newClass: LiveClassItem = {
      id: newId,
      title: formData.title,
      topic: formData.topic || formData.title,
      description: formData.description || `Live session for ${formData.title}`,
      subject_id: 'subj-general',
      grade_id: 'grd-all',
      teacher_id: 'usr-2',
      scheduled_at: formData.scheduledAt || new Date().toISOString(),
      duration_minutes: Number(formData.durationMinutes) || 60,
      meeting_id: meetingId,
      passcode: passcode,
      status: 'scheduled',
      recording_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      teacher: {
        id: 'usr-2',
        user_id: 'auth-2',
        full_name: formData.teacherName || 'Ram Sharma',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        role: 'teacher',
        grade_id: null,
        school: 'Senior Faculty',
        district: 'Kathmandu',
        xp: 4500,
        level: 25,
        streak_current: 12,
        streak_longest: 20,
        streak_last_date: null,
        streak_freeze_remaining: 2,
        settings: {
          locale: 'en',
          theme: 'system',
          data_saver: false,
          notifications_email: true,
          notifications_push: true,
          daily_goal_minutes: 30,
          privacy_show_profile: true,
          privacy_show_leaderboard: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const adminClient = await createAdminClient();
      await adminClient.from('live_classes').insert({
        id: newId,
        title: newClass.title,
        topic: newClass.topic,
        description: newClass.description,
        scheduled_at: newClass.scheduled_at,
        duration_minutes: newClass.duration_minutes,
        meeting_id: newClass.meeting_id,
        passcode: newClass.passcode,
        status: newClass.status,
      });
    }

    // Also sync to session store
    createNewLiveSession({
      id: newId,
      title: newClass.title,
      topic: newClass.topic || '',
      description: newClass.description || '',
      subject: formData.subjectName || 'Mathematics',
      grade: formData.gradeName || 'Grade 10',
      teacherName: formData.teacherName || 'Ram Sharma',
      scheduledAt: newClass.scheduled_at,
      durationMinutes: newClass.duration_minutes,
      meetingNumber: meetingId,
      passcode: passcode,
      status: 'upcoming',
    });

    mockAdminLiveClasses = [newClass, ...mockAdminLiveClasses];

    revalidatePath('/admin/live-classes');
    revalidatePath('/live');
    return { success: true, data: newClass };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to schedule class';
    return { success: false, error: msg };
  }
}

export async function updateLiveClassStatusAction(
  classId: string,
  newStatus: 'scheduled' | 'live' | 'ended' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
  try {
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const adminClient = await createAdminClient();
      await adminClient
        .from('live_classes')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', classId);
    }

    const index = mockAdminLiveClasses.findIndex((c) => c.id === classId);
    if (index !== -1) {
      mockAdminLiveClasses[index] = {
        ...mockAdminLiveClasses[index],
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
    }

    const sessionStoreStatus = newStatus === 'scheduled' ? 'upcoming' : newStatus === 'cancelled' ? 'ended' : newStatus;
    updateLiveSession(classId, { status: sessionStoreStatus as 'live' | 'upcoming' | 'ended' });

    revalidatePath('/admin/live-classes');
    revalidatePath('/live');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update status';
    return { success: false, error: msg };
  }
}

export async function deleteLiveClassAction(
  classId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const adminClient = await createAdminClient();
      await adminClient.from('live_classes').delete().eq('id', classId);
    }

    mockAdminLiveClasses = mockAdminLiveClasses.filter((c) => c.id !== classId);

    revalidatePath('/admin/live-classes');
    revalidatePath('/live');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete class';
    return { success: false, error: msg };
  }
}
