'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Filter,
  Search,
  ChevronDown,
  Play,
  Video,
  Code,
  Globe2,
  Brain,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Demo courses
const demoCourses = [
  {
    id: '1', slug: 'grade-8-mathematics', title: 'Grade 8 Mathematics', subtitle: 'Complete NEB curriculum',
    instructor: 'Ram Sharma', category: 'School Foundation', difficulty: 'intermediate' as const,
    duration: 2400, lessons: 48, enrolled: 1250, rating: 4.7, isFree: true,
    grade: 'Grade 8', subject: 'Mathematics', thumbnail: null,
    tags: ['Algebra', 'Geometry', 'Statistics'],
  },
  {
    id: '2', slug: 'grade-9-science', title: 'Grade 9 Science', subtitle: 'Physics, Chemistry, Biology',
    instructor: 'Sujata Adhikari', category: 'School Foundation', difficulty: 'intermediate' as const,
    duration: 3000, lessons: 62, enrolled: 980, rating: 4.8, isFree: true,
    grade: 'Grade 9', subject: 'Science', thumbnail: null,
    tags: ['Physics', 'Chemistry', 'Biology'],
  },
  {
    id: '3', slug: 'see-mathematics-preparation', title: 'SEE Mathematics Preparation', subtitle: 'Mock exams, revision, chapter tests',
    instructor: 'Bishal Khadka', category: 'SEE Preparation', difficulty: 'advanced' as const,
    duration: 1800, lessons: 36, enrolled: 2100, rating: 4.9, isFree: false,
    grade: 'Grade 10', subject: 'Mathematics', thumbnail: null,
    tags: ['Mock Exams', 'Revision', 'Timed Practice'],
  },
  {
    id: '4', slug: 'chatgpt-for-students', title: 'ChatGPT for Students', subtitle: 'Learn to use AI responsibly for studying',
    instructor: 'Anish Poudel', category: 'Future Skills', difficulty: 'beginner' as const,
    duration: 600, lessons: 12, enrolled: 3400, rating: 4.6, isFree: true,
    grade: 'All Levels', subject: 'AI & Technology', thumbnail: null,
    tags: ['Prompting', 'Research', 'Writing', 'Coding'],
  },
  {
    id: '5', slug: 'english-speaking-basics', title: 'English Speaking Basics', subtitle: 'Build confidence in everyday English',
    instructor: 'Prakriti Rai', category: 'Language Academy', difficulty: 'beginner' as const,
    duration: 900, lessons: 18, enrolled: 1800, rating: 4.5, isFree: true,
    grade: 'All Levels', subject: 'English', thumbnail: null,
    tags: ['Pronunciation', 'Vocabulary', 'Conversation'],
  },
  {
    id: '6', slug: 'python-programming-basics', title: 'Python Programming Basics', subtitle: 'Start coding from zero',
    instructor: 'Rohan Shrestha', category: 'Future Skills', difficulty: 'beginner' as const,
    duration: 1200, lessons: 24, enrolled: 2200, rating: 4.7, isFree: true,
    grade: 'All Levels', subject: 'Coding', thumbnail: null,
    tags: ['Variables', 'Functions', 'Loops', 'Projects'],
  },
  {
    id: '7', slug: 'grade-10-english', title: 'Grade 10 English', subtitle: 'Complete NEB English curriculum',
    instructor: 'Binod Thapa', category: 'School Foundation', difficulty: 'intermediate' as const,
    duration: 2000, lessons: 40, enrolled: 1100, rating: 4.4, isFree: true,
    grade: 'Grade 10', subject: 'English', thumbnail: null,
    tags: ['Grammar', 'Writing', 'Reading', 'Literature'],
  },
  {
    id: '8', slug: 'web-development-fundamentals', title: 'Web Development Fundamentals', subtitle: 'HTML, CSS, and JavaScript',
    instructor: 'Anish Poudel', category: 'Future Skills', difficulty: 'beginner' as const,
    duration: 1500, lessons: 30, enrolled: 1600, rating: 4.8, isFree: true,
    grade: 'All Levels', subject: 'Coding', thumbnail: null,
    tags: ['HTML', 'CSS', 'JavaScript', 'Projects'],
  },
];

const categories = ['All', 'School Foundation', 'SEE Preparation', '+2 Preparation', 'Future Skills', 'Language Academy'];
const grades = ['All Grades', 'Grade 1-5', 'Grade 6-8', 'Grade 9-10', 'Grade 11-12', 'All Levels'];
const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const categoryIcons: Record<string, React.ElementType> = {
  'School Foundation': GraduationCap,
  'SEE Preparation': BookOpen,
  '+2 Preparation': BookOpen,
  'Future Skills': Code,
  'Language Academy': Globe2,
};

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  if (hrs === 0) return `${minutes} min`;
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export default function CoursesPage() {
  const t = useTranslations('course');
  const tCommon = useTranslations('common');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = demoCourses.filter(course => {
    if (selectedCategory !== 'All' && course.category !== selectedCategory) return false;
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !course.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Header />
      <main className="container-narrow py-8 pb-24 lg:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] tracking-tight">
            Courses
          </h1>
          <p className="text-sm text-[hsl(var(--foreground-secondary))] mt-1">
            From textbook basics to future-ready skills. {demoCourses.length} courses available.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-tertiary))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={tCommon('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--input))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === cat
                  ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--background-tertiary))]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(course => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden hover:border-[hsl(var(--border-hover))] hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] bg-[hsl(var(--muted))] flex items-center justify-center">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center",
                    course.category === 'Future Skills' ? 'bg-[hsl(var(--accent-light))]' :
                    course.category === 'SEE Preparation' ? 'bg-[hsl(var(--secondary-light))]' :
                    'bg-[hsl(var(--primary-light))]'
                  )}>
                    {course.category === 'Future Skills' ? <Code className="w-6 h-6 text-[hsl(var(--accent))]" /> :
                     course.category === 'Language Academy' ? <Globe2 className="w-6 h-6 text-[hsl(var(--secondary))]" /> :
                     <BookOpen className="w-6 h-6 text-[hsl(var(--primary))]" />}
                  </div>
                  {course.isFree ? (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-xs font-semibold text-[hsl(var(--success))] bg-[hsl(var(--success-light))] rounded-md">
                      {tCommon('free')}
                    </span>
                  ) : (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-xs font-semibold text-[hsl(var(--secondary))] bg-[hsl(var(--secondary-light))] rounded-md">
                      {tCommon('premium')}
                    </span>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-xs font-medium text-[hsl(var(--foreground))] bg-[hsl(var(--card)/0.9)] backdrop-blur-sm rounded-md">
                    {course.grade}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-[hsl(var(--primary))] font-medium mb-1">{course.category}</p>
                  <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] line-clamp-2 mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[hsl(var(--foreground-secondary))] line-clamp-1 mb-3">
                    {course.subtitle}
                  </p>
                  <p className="text-xs text-[hsl(var(--foreground-tertiary))] mb-3">{course.instructor}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] text-[hsl(var(--foreground-secondary))] bg-[hsl(var(--muted))] rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--foreground-tertiary))] pt-3 border-t border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {course.lessons}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(course.duration)}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[hsl(var(--xp))]">
                      <Star className="w-3 h-3 fill-current" />
                      {course.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-[hsl(var(--foreground-tertiary))] mx-auto mb-4" />
            <p className="text-sm text-[hsl(var(--foreground-secondary))]">{tCommon('noResults')}</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
