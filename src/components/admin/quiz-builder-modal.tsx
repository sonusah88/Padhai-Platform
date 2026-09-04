'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Eye,
  Settings,
  ArrowRight,
  Clock,
  Award,
} from 'lucide-react';
import { Quiz, QuizQuestion, QuizQuestionOption } from '@/lib/types';
import { saveQuizAction } from '@/lib/actions/quizzes';
import { cn } from '@/lib/utils';

interface QuizBuilderModalProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedQuiz: Quiz) => void;
}

export function QuizBuilderModal({ quiz, isOpen, onClose, onSuccess }: QuizBuilderModalProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(quiz?.time_limit_minutes || 15);
  const [passPercentage, setPassPercentage] = useState(quiz?.pass_percentage || 50);

  const [questions, setQuestions] = useState<QuizQuestion[]>(
    quiz?.questions || [
      {
        id: 'q-1',
        text: 'What is the solution of 3x + 6 = 21 ?',
        marks: 2,
        explanation: '3x = 15 => x = 5',
        options: [
          { id: 'opt-1', text: '4', is_correct: false },
          { id: 'opt-2', text: '5', is_correct: true },
          { id: 'opt-3', text: '6', is_correct: false },
          { id: 'opt-4', text: '7', is_correct: false },
        ],
      },
    ]
  );

  // Preview test state
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string>>({});
  const [previewScore, setPreviewScore] = useState<number | null>(null);

  if (!isOpen) return null;

  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);

  // Add Question
  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      text: '',
      marks: 2,
      explanation: '',
      options: [
        { id: `opt-${Date.now()}-1`, text: '', is_correct: true },
        { id: `opt-${Date.now()}-2`, text: '', is_correct: false },
        { id: `opt-${Date.now()}-3`, text: '', is_correct: false },
        { id: `opt-${Date.now()}-4`, text: '', is_correct: false },
      ],
    };
    setQuestions([...questions, newQ]);
  };

  // Remove Question
  const handleRemoveQuestion = (idx: number) => {
    if (questions.length === 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Update Question Text / Marks / Explanation
  const handleUpdateQuestion = (idx: number, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, ...updates } : q)));
  };

  // Add Option to Question
  const handleAddOption = (qIdx: number) => {
    const q = questions[qIdx];
    const newOpt: QuizQuestionOption = {
      id: `opt-${Date.now()}-${q.options.length + 1}`,
      text: '',
      is_correct: false,
    };
    handleUpdateQuestion(qIdx, { options: [...q.options, newOpt] });
  };

  // Remove Option
  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx];
    if (q.options.length <= 2) {
      alert('Question must have at least 2 options.');
      return;
    }
    handleUpdateQuestion(qIdx, {
      options: q.options.filter((_, i) => i !== optIdx),
    });
  };

  // Mark Option Correct
  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx];
    const updatedOptions = q.options.map((opt, i) => ({
      ...opt,
      is_correct: i === optIdx,
    }));
    handleUpdateQuestion(qIdx, { options: updatedOptions });
  };

  // Update Option Text
  const handleUpdateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const q = questions[qIdx];
    const updatedOptions = q.options.map((opt, i) => (i === optIdx ? { ...opt, text } : opt));
    handleUpdateQuestion(qIdx, { options: updatedOptions });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please provide a quiz title.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await saveQuizAction({
        id: quiz?.id,
        title,
        description,
        time_limit_minutes: timeLimitMinutes,
        total_marks: totalMarks,
        pass_percentage: passPercentage,
        questions,
        status: 'published',
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        alert(res.error || 'Failed to save quiz');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving quiz';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
                {quiz ? 'Edit Quiz & Assessment' : 'Create Dynamic Quiz'}
              </h2>
              <p className="text-xs text-[hsl(var(--foreground-secondary))]">
                {questions.length} questions • {totalMarks} total marks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
                isPreviewMode
                  ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                  : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Exit Test' : 'Test Preview'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isPreviewMode ? (
            /* INTERACTIVE TEST PREVIEW MODE */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[hsl(var(--primary-light))] border border-[hsl(var(--primary)/0.15)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">{title || 'Quiz Preview'}</h3>
                  <p className="text-xs text-[hsl(var(--foreground-secondary))]">{description || 'Student view simulator'}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span>⏱️ {timeLimitMinutes} mins</span>
                  <span>🏆 {totalMarks} Marks</span>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))] space-y-3">
                    <p className="text-xs font-bold text-[hsl(var(--foreground))]">
                      Q{qIdx + 1}. {q.text || '(Question text empty)'} ({q.marks} marks)
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = previewAnswers[q.id] === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setPreviewAnswers({ ...previewAnswers, [q.id]: opt.id })}
                            className={cn(
                              'p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2',
                              isSelected
                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary-light))] font-semibold text-[hsl(var(--primary))]'
                                : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--card))]'
                            )}
                          >
                            <span className="w-4 h-4 rounded-full border border-[hsl(var(--border))] flex items-center justify-center text-[10px]">
                              {isSelected && '✓'}
                            </span>
                            <span>{opt.text || '(Option text empty)'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* BUILDER EDITOR MODE */
            <div className="space-y-6 text-xs">
              {/* Quiz Meta */}
              <div className="space-y-3 p-4 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                <div>
                  <label className="block font-semibold mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chapter 4: Linear Equations & Graphs Speed Quiz"
                    className="w-full px-3.5 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Time Limit (Minutes)</label>
                    <input
                      type="number"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Passing Score (%)</label>
                    <input
                      type="number"
                      value={passPercentage}
                      onChange={(e) => setPassPercentage(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))]"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--foreground-secondary))]">
                    Questions ({questions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))] font-bold text-xs hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[hsl(var(--primary))] text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {qIdx + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => handleUpdateQuestion(qIdx, { text: e.target.value })}
                          placeholder={`Type question ${qIdx + 1}...`}
                          className="w-full px-3.5 py-2 bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-xs font-semibold text-[hsl(var(--foreground))]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleUpdateQuestion(qIdx, { marks: Number(e.target.value) })}
                          title="Marks"
                          className="w-16 px-2 py-2 bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-xs font-mono text-center text-[hsl(var(--foreground))]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="p-2 text-[hsl(var(--foreground-tertiary))] hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="space-y-2 pl-9">
                      <p className="text-[10px] font-bold text-[hsl(var(--foreground-tertiary))] uppercase tracking-wider">
                        Options (Select the radio to mark as correct answer)
                      </p>
                      {q.options.map((opt, optIdx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={opt.is_correct}
                            onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                            className="w-4 h-4 text-[hsl(var(--primary))] cursor-pointer accent-[hsl(var(--primary))]"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className={cn(
                              'flex-1 px-3 py-1.5 border rounded-lg text-xs',
                              opt.is_correct
                                ? 'border-emerald-500 bg-emerald-500/5 font-semibold text-emerald-700 dark:text-emerald-300'
                                : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
                            )}
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIdx, optIdx)}
                              className="p-1 text-[hsl(var(--foreground-tertiary))] hover:text-rose-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-[11px] font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    {/* Explanation hint */}
                    <div className="pl-9 pt-2 border-t border-[hsl(var(--border))]">
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateQuestion(qIdx, { explanation: e.target.value })}
                        placeholder="Explanation hint for students after submission (optional)..."
                        className="w-full px-3 py-1.5 bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))] rounded-lg text-[11px] text-[hsl(var(--foreground-secondary))]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
          <div className="text-xs text-[hsl(var(--foreground-secondary))] font-semibold">
            Total Marks: <strong className="text-[hsl(var(--primary))]">{totalMarks}</strong>
          </div>

          <div className="flex items-center gap-2">
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
              {isSubmitting ? 'Saving Quiz...' : 'Save & Publish Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
