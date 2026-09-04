'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { Quiz } from '@/lib/types';

let mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Grade 8 Mathematics: Linear Equations Speed Quiz',
    description: '10 Questions testing transposition, fractional linear terms, and graph coordinates.',
    subject_id: 'subj-math',
    grade_id: 'grd-8',
    time_limit_minutes: 15,
    total_marks: 20,
    pass_percentage: 50,
    status: 'published',
    created_by: 'usr-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        text: 'What is the value of x in the linear equation: 3x - 7 = 14 ?',
        marks: 2,
        explanation: '3x = 14 + 7 = 21 => x = 21/3 = 7',
        options: [
          { id: 'opt1', text: '5', is_correct: false },
          { id: 'opt2', text: '7', is_correct: true },
          { id: 'opt3', text: '9', is_correct: false },
          { id: 'opt4', text: '6', is_correct: false },
        ],
      },
      {
        id: 'q2',
        text: 'If (x / 2) + 4 = 10, then what is the value of 2x ?',
        marks: 2,
        explanation: 'x/2 = 6 => x = 12. Therefore 2x = 24.',
        options: [
          { id: 'opt5', text: '12', is_correct: false },
          { id: 'opt6', text: '24', is_correct: true },
          { id: 'opt7', text: '18', is_correct: false },
          { id: 'opt8', text: '6', is_correct: false },
        ],
      },
      {
        id: 'q3',
        text: 'Which coordinate point lies on the line defined by y = 2x + 1 ?',
        marks: 2,
        explanation: 'When x=2, y=2(2)+1=5, so (2, 5) lies on the line.',
        options: [
          { id: 'opt9', text: '(1, 2)', is_correct: false },
          { id: 'opt10', text: '(2, 5)', is_correct: true },
          { id: 'opt11', text: '(3, 6)', is_correct: false },
          { id: 'opt12', text: '(0, 3)', is_correct: false },
        ],
      },
    ],
  },
  {
    id: 'quiz-2',
    title: 'SEE Science: Optics & Refraction of Light Test',
    description: 'Exam-pattern quiz covering refractive index, Snell\'s law, and focal length calculations.',
    subject_id: 'subj-sci',
    grade_id: 'grd-10',
    time_limit_minutes: 20,
    total_marks: 25,
    pass_percentage: 60,
    status: 'published',
    created_by: 'usr-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: 'q4',
        text: 'What is the speed of light in vacuum?',
        marks: 2,
        explanation: 'Speed of light c = 3 x 10^8 m/s in vacuum.',
        options: [
          { id: 'opt13', text: '3 × 10⁸ m/s', is_correct: true },
          { id: 'opt14', text: '3 × 10⁶ m/s', is_correct: false },
          { id: 'opt15', text: '2.25 × 10⁸ m/s', is_correct: false },
          { id: 'opt16', text: '3 × 10¹⁰ m/s', is_correct: false },
        ],
      },
    ],
  },
];

export async function getAdminQuizzesAction(): Promise<Quiz[]> {
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Quiz[];
      }
    } catch {
      // Fallback
    }
  }

  return mockQuizzes;
}

export async function saveQuizAction(
  quizData: Partial<Quiz>
): Promise<{ success: boolean; data?: Quiz; error?: string }> {
  try {
    const isEdit = !!quizData.id;
    const quizId = quizData.id || `quiz-${Date.now()}`;

    const newQuiz: Quiz = {
      id: quizId,
      title: quizData.title || 'Untitled Quiz',
      description: quizData.description || '',
      subject_id: quizData.subject_id || 'subj-gen',
      grade_id: quizData.grade_id || 'grd-all',
      time_limit_minutes: Number(quizData.time_limit_minutes) || 15,
      total_marks: Number(quizData.total_marks) || 10,
      pass_percentage: Number(quizData.pass_percentage) || 40,
      questions: quizData.questions || [],
      created_by: 'usr-admin',
      status: quizData.status || 'published',
      created_at: quizData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const adminClient = await createAdminClient();
      if (isEdit) {
        await adminClient
          .from('quizzes')
          .update({
            title: newQuiz.title,
            description: newQuiz.description,
            time_limit_minutes: newQuiz.time_limit_minutes,
            total_marks: newQuiz.total_marks,
            pass_percentage: newQuiz.pass_percentage,
            questions: newQuiz.questions,
            status: newQuiz.status,
            updated_at: newQuiz.updated_at,
          })
          .eq('id', quizId);
      } else {
        await adminClient.from('quizzes').insert({
          id: newQuiz.id,
          title: newQuiz.title,
          description: newQuiz.description,
          time_limit_minutes: newQuiz.time_limit_minutes,
          total_marks: newQuiz.total_marks,
          pass_percentage: newQuiz.pass_percentage,
          questions: newQuiz.questions,
          status: newQuiz.status,
        });
      }
    }

    if (isEdit) {
      const idx = mockQuizzes.findIndex((q) => q.id === quizId);
      if (idx !== -1) mockQuizzes[idx] = newQuiz;
    } else {
      mockQuizzes = [newQuiz, ...mockQuizzes];
    }

    revalidatePath('/admin/quizzes');
    revalidatePath('/admin');
    return { success: true, data: newQuiz };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save quiz';
    return { success: false, error: msg };
  }
}

export async function deleteQuizAction(
  quizId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const adminClient = await createAdminClient();
      await adminClient.from('quizzes').delete().eq('id', quizId);
    }

    mockQuizzes = mockQuizzes.filter((q) => q.id !== quizId);

    revalidatePath('/admin/quizzes');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete quiz';
    return { success: false, error: msg };
  }
}
