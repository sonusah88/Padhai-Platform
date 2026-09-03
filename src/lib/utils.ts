import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for Nepal timezone display
 */
export function formatNepalDate(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ne' ? 'ne-NP' : 'en-US', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for Nepal timezone
 */
export function formatNepalTime(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale === 'ne' ? 'ne-NP' : 'en-US', {
    timeZone: 'Asia/Kathmandu',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format Nepal currency (NPR)
 */
export function formatNPR(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'ne' ? 'ne-NP' : 'en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatNepalDate(d);
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Calculate percentage safely
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '…';
}

/**
 * Delay utility for debouncing
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get grade display name
 */
export function getGradeDisplay(gradeNumber: number): string {
  if (gradeNumber <= 10) return `Grade ${gradeNumber}`;
  if (gradeNumber === 11) return 'Grade 11 (+2)';
  if (gradeNumber === 12) return 'Grade 12 (+2)';
  return `Grade ${gradeNumber}`;
}

/**
 * Difficulty label and color
 */
export function getDifficultyInfo(difficulty: string): { label: string; color: string } {
  switch (difficulty) {
    case 'beginner':
      return { label: 'Beginner', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' };
    case 'intermediate':
      return { label: 'Intermediate', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950' };
    case 'advanced':
      return { label: 'Advanced', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950' };
    default:
      return { label: difficulty, color: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950' };
  }
}
