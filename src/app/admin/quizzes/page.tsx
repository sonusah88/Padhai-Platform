'use client';

import { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Award,
  CheckCircle2,
  Search,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Quiz } from '@/lib/types';
import { getAdminQuizzesAction, deleteQuizAction } from '@/lib/actions/quizzes';
import { QuizBuilderModal } from '@/components/admin/quiz-builder-modal';
import { cn } from '@/lib/utils';

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuizForEdit, setSelectedQuizForEdit] = useState<Quiz | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getAdminQuizzesAction();
      setQuizzes(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    const res = await deleteQuizAction(id);
    if (res.success) {
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } else {
      alert(res.error || 'Failed to delete');
    }
  };

  const handleSaved = (savedQuiz: Quiz) => {
    const exists = quizzes.some((q) => q.id === savedQuiz.id);
    if (exists) {
      setQuizzes((prev) => prev.map((q) => (q.id === savedQuiz.id ? savedQuiz : q)));
    } else {
      setQuizzes([savedQuiz, ...quizzes]);
    }
  };

  const filtered = quizzes.filter((q) => {
    if (
      searchQuery &&
      !q.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !q.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[hsl(var(--foreground))]">
            Dynamic Quiz &amp; Assessment Builder
          </h1>
          <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-0.5">
            Create interactive quizzes, set time limits, specify correct answer keys, and test questions in real-time.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedQuizForEdit(null);
            setIsBuilderOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-tertiary))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <span className="text-xs font-semibold text-[hsl(var(--foreground-secondary))]">
          {quizzes.length} Quizzes Published
        </span>
      </div>

      {/* Quizzes Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-[hsl(var(--foreground-secondary))]">
            Loading quizzes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground-secondary))] space-y-2">
            <HelpCircle className="w-8 h-8 text-[hsl(var(--foreground-tertiary))] mx-auto" />
            <p className="font-semibold text-sm text-[hsl(var(--foreground))]">No quizzes found</p>
            <p>Click the button above to build your first dynamic quiz.</p>
          </div>
        ) : (
          filtered.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {q.questions.length} Questions
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-[hsl(var(--foreground-tertiary))]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {q.time_limit_minutes}m
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {q.total_marks} Marks
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[hsl(var(--foreground))] line-clamp-2">
                  {q.title}
                </h3>
                <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-1 line-clamp-2">
                  {q.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Pass: {q.pass_percentage}%
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedQuizForEdit(q);
                      setIsBuilderOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary-light))] hover:text-[hsl(var(--primary))] text-xs font-semibold text-[hsl(var(--foreground))] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit &amp; Test</span>
                  </button>

                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="p-1.5 text-[hsl(var(--foreground-tertiary))] hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quiz Builder Modal */}
      <QuizBuilderModal
        quiz={selectedQuizForEdit}
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setSelectedQuizForEdit(null);
        }}
        onSuccess={handleSaved}
      />
    </div>
  );
}
