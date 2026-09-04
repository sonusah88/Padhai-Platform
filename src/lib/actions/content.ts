'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { RecordedVideo, StudyMaterial } from '@/lib/types';

let mockVideos: RecordedVideo[] = [
  {
    id: 'vid-1',
    title: 'Linear Equations & Graphical Systems Masterclass',
    description: 'Comprehensive walkthrough of linear equations, elimination method, and board exam problems.',
    video_url: 'https://customer-example.cloudflarestream.com/demo1/manifest/video.m3u8',
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=450',
    duration_seconds: 3600,
    subject_id: 'subj-math',
    grade_id: 'grd-8',
    course_id: null,
    uploaded_by: 'usr-2',
    status: 'published',
    views_count: 420,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    title: 'Optics: Refraction through Prisms & Lenses',
    description: 'SEE exam special: Complete optical derivations and ray diagrams with practice numericals.',
    video_url: 'https://customer-example.cloudflarestream.com/demo2/manifest/video.m3u8',
    thumbnail_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=450',
    duration_seconds: 4500,
    subject_id: 'subj-sci',
    grade_id: 'grd-10',
    course_id: null,
    uploaded_by: 'usr-3',
    status: 'published',
    views_count: 890,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockMaterials: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Grade 8 Mathematics — Linear Equations Practice Worksheet',
    description: '15 Board model practice questions with step-by-step answer keys and hints.',
    file_url: 'https://example.com/files/math_linear_equations_worksheet.pdf',
    file_size_bytes: 2450000,
    file_type: 'pdf',
    subject_id: 'subj-math',
    grade_id: 'grd-8',
    course_id: null,
    uploaded_by: 'usr-2',
    download_count: 310,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mat-2',
    title: 'SEE Science Formula & Definitions Complete Handbook',
    description: 'All Physics & Chemistry formulae, SI units, and definitions compiled for rapid revision.',
    file_url: 'https://example.com/files/see_science_handbook.pdf',
    file_size_bytes: 4800000,
    file_type: 'pdf',
    subject_id: 'subj-sci',
    grade_id: 'grd-10',
    course_id: null,
    uploaded_by: 'usr-3',
    download_count: 940,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mat-3',
    title: 'English Grammar Rules Cheat Sheet: Voice & Reported Speech',
    description: 'Transforming direct to indirect speech and active to passive voice with exceptions.',
    file_url: 'https://example.com/files/grammar_rules.pdf',
    file_size_bytes: 1200000,
    file_type: 'pdf',
    subject_id: 'subj-eng',
    grade_id: 'grd-9',
    course_id: null,
    uploaded_by: 'usr-2',
    download_count: 512,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getAdminContentAction(): Promise<{
  videos: RecordedVideo[];
  materials: StudyMaterial[];
}> {
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const [{ data: vData }, { data: mData }] = await Promise.all([
        supabase.from('recorded_videos').select('*').order('created_at', { ascending: false }),
        supabase.from('study_materials').select('*').order('created_at', { ascending: false }),
      ]);

      return {
        videos: (vData as RecordedVideo[]) || mockVideos,
        materials: (mData as StudyMaterial[]) || mockMaterials,
      };
    } catch {
      // Fallback
    }
  }

  return {
    videos: mockVideos,
    materials: mockMaterials,
  };
}

export async function uploadRecordedVideoAction(formData: {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  subjectName?: string;
  gradeName?: string;
}): Promise<{ success: boolean; data?: RecordedVideo; error?: string }> {
  try {
    const newVideo: RecordedVideo = {
      id: `vid-${Date.now()}`,
      title: formData.title,
      description: formData.description || '',
      video_url: formData.videoUrl,
      thumbnail_url: formData.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=450',
      duration_seconds: Number(formData.durationSeconds) || 1800,
      subject_id: 'subj-gen',
      grade_id: 'grd-all',
      course_id: null,
      uploaded_by: 'usr-admin',
      status: 'published',
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const adminClient = await createAdminClient();
      await adminClient.from('recorded_videos').insert({
        id: newVideo.id,
        title: newVideo.title,
        description: newVideo.description,
        video_url: newVideo.video_url,
        thumbnail_url: newVideo.thumbnail_url,
        duration_seconds: newVideo.duration_seconds,
        status: newVideo.status,
      });
    }

    mockVideos = [newVideo, ...mockVideos];

    revalidatePath('/admin/content');
    revalidatePath('/admin');
    return { success: true, data: newVideo };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to upload video';
    return { success: false, error: msg };
  }
}

export async function uploadStudyMaterialAction(formData: {
  title: string;
  description?: string;
  fileUrl: string;
  fileSizeBytes?: number;
  fileType?: string;
  subjectName?: string;
  gradeName?: string;
}): Promise<{ success: boolean; data?: StudyMaterial; error?: string }> {
  try {
    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: formData.title,
      description: formData.description || '',
      file_url: formData.fileUrl,
      file_size_bytes: Number(formData.fileSizeBytes) || 1500000,
      file_type: formData.fileType || 'pdf',
      subject_id: 'subj-gen',
      grade_id: 'grd-all',
      course_id: null,
      uploaded_by: 'usr-admin',
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const adminClient = await createAdminClient();
      await adminClient.from('study_materials').insert({
        id: newMaterial.id,
        title: newMaterial.title,
        description: newMaterial.description,
        file_url: newMaterial.file_url,
        file_size_bytes: newMaterial.file_size_bytes,
        file_type: newMaterial.file_type,
      });
    }

    mockMaterials = [newMaterial, ...mockMaterials];

    revalidatePath('/admin/content');
    revalidatePath('/admin');
    return { success: true, data: newMaterial };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to upload material';
    return { success: false, error: msg };
  }
}

export async function deleteContentItemAction(
  id: string,
  type: 'video' | 'material'
): Promise<{ success: boolean; error?: string }> {
  try {
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const adminClient = await createAdminClient();
      const table = type === 'video' ? 'recorded_videos' : 'study_materials';
      await adminClient.from(table).delete().eq('id', id);
    }

    if (type === 'video') {
      mockVideos = mockVideos.filter((v) => v.id !== id);
    } else {
      mockMaterials = mockMaterials.filter((m) => m.id !== id);
    }

    revalidatePath('/admin/content');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete content';
    return { success: false, error: msg };
  }
}
