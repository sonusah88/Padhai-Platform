// =============================================================================
// Database Types — mirrors Supabase schema
// These types define the shape of all database tables.
// In production, generate these from Supabase CLI: npx supabase gen types
// =============================================================================

export type UserRole = 'student' | 'teacher' | 'parent' | 'content_manager' | 'admin' | 'super_admin';
export type CourseStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type LessonType = 'video' | 'article' | 'pdf' | 'quiz' | 'assignment' | 'interactive' | 'coding' | 'discussion' | 'live';
export type QuestionType = 'mcq' | 'true_false' | 'fill_blank' | 'numerical' | 'matching' | 'ordering' | 'short_answer' | 'coding' | 'image_based';
export type AssessmentType = 'quiz' | 'chapter_test' | 'mock_exam' | 'practice' | 'daily_challenge' | 'weekly_challenge' | 'competition';
export type CompetitionType = 'daily' | 'weekly' | 'subject_tournament' | 'improvement' | 'skill' | 'inter_school';
export type LiveSessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

// -- User & Profile --

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  grade_id: string | null;
  school: string | null;
  district: string | null;
  xp: number;
  level: number;
  streak_current: number;
  streak_longest: number;
  streak_last_date: string | null;
  streak_freeze_remaining: number;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  locale: 'en' | 'ne';
  theme: 'light' | 'dark' | 'system';
  data_saver: boolean;
  notifications_email: boolean;
  notifications_push: boolean;
  daily_goal_minutes: number;
  privacy_show_profile: boolean;
  privacy_show_leaderboard: boolean;
}

export interface StudentProfile {
  profile_id: string;
  grade_id: string | null;
  interests: string[];
  preparing_for: string | null;
  onboarding_complete: boolean;
}

export interface TeacherProfile {
  profile_id: string;
  bio: string | null;
  specializations: string[];
  qualifications: string[];
}

export interface ParentProfile {
  profile_id: string;
  linked_student_ids: string[];
}

// -- Curriculum --

export interface EducationSystem {
  id: string;
  name: string;
  country: string;
}

export interface Grade {
  id: string;
  system_id: string;
  name: string;
  name_ne: string;
  display_order: number;
}

export interface Subject {
  id: string;
  name: string;
  name_ne: string;
  icon: string;
  color: string;
}

export interface GradeSubject {
  grade_id: string;
  subject_id: string;
}

export interface CurriculumUnit {
  id: string;
  subject_id: string;
  grade_id: string;
  name: string;
  name_ne: string;
  display_order: number;
}

export interface Chapter {
  id: string;
  unit_id: string;
  name: string;
  name_ne: string;
  display_order: number;
}

export interface Concept {
  id: string;
  chapter_id: string;
  name: string;
  description: string | null;
  prerequisites: string[];
}

// -- Courses & Lessons --

export interface Course {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  instructor_id: string;
  thumbnail_url: string | null;
  category: string;
  difficulty: Difficulty;
  duration_minutes: number;
  prerequisites: string[];
  is_free: boolean;
  status: CourseStatus;
  grade_id: string | null;
  subject_id: string | null;
  enrolled_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  instructor?: Profile;
  sections?: CourseSection[];
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  display_order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  type: LessonType;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  display_order: number;
  concept_ids: string[];
  status: ContentStatus;
  // Joined
  resources?: Resource[];
  progress?: LearningProgress;
}

export interface Resource {
  id: string;
  lesson_id: string | null;
  course_id: string | null;
  title: string;
  type: string;
  url: string;
  size_bytes: number | null;
}

// -- Assessments --

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  text_ne: string | null;
  options: QuestionOption[] | null;
  correct_answer: string;
  explanation: string | null;
  subject_id: string | null;
  grade_id: string | null;
  chapter_id: string | null;
  concept_id: string | null;
  difficulty: Difficulty;
  marks: number;
  time_seconds: number;
  image_url: string | null;
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  course_id: string | null;
  chapter_id: string | null;
  subject_id: string | null;
  grade_id: string | null;
  time_limit_minutes: number | null;
  total_marks: number;
  question_ids: string[];
  pass_percentage: number | null;
  status: ContentStatus;
  created_at: string;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  total: number;
  answers: AnswerRecord[];
  analysis: AssessmentAnalysis | null;
}

export interface AnswerRecord {
  question_id: string;
  answer: string;
  is_correct: boolean;
  time_seconds: number;
}

export interface AssessmentAnalysis {
  accuracy: number;
  time_taken_seconds: number;
  strong_topics: string[];
  weak_topics: string[];
  percentile: number | null;
  improvement_vs_previous: number | null;
  recommendation: string | null;
}

// -- Live Sessions --

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  subject_id: string | null;
  grade_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  stream_key: string | null;
  playback_url: string | null;
  recording_url: string | null;
  status: LiveSessionStatus;
  resources: string[];
  max_participants: number | null;
  created_at: string;
  // Joined
  instructor?: Profile;
  subject?: Subject;
  grade?: Grade;
  attendance_count?: number;
}

export interface LiveAttendance {
  session_id: string;
  user_id: string;
  joined_at: string;
  left_at: string | null;
  duration_seconds: number;
}

// -- Competitions --

export interface Competition {
  id: string;
  title: string;
  description: string | null;
  type: CompetitionType;
  subject_id: string | null;
  grade_id: string | null;
  assessment_id: string | null;
  start_at: string;
  end_at: string;
  rules: string | null;
  status: ContentStatus;
  max_participants: number | null;
  created_at: string;
  // Joined
  subject?: Subject;
  participant_count?: number;
}

export interface CompetitionParticipant {
  competition_id: string;
  user_id: string;
  score: number;
  rank: number | null;
  improvement_pct: number | null;
  submitted_at: string | null;
}

// -- Progress & Gamification --

export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string | null;
  course_id: string | null;
  status: ProgressStatus;
  progress_pct: number;
  completed_at: string | null;
  last_accessed_at: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  source_id: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  name_ne: string | null;
  description: string;
  icon: string;
  criteria: Record<string, unknown>;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Badge {
  id: string;
  name: string;
  name_ne: string | null;
  description: string;
  icon: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

// -- Platform --

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// -- API Response Types --

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// -- Dashboard Types --

export interface StudentDashboard {
  profile: Profile;
  greeting: string;
  weekly_goal_progress: number;
  upcoming_live_class: LiveSession | null;
  continue_learning: {
    course: Course;
    lesson: Lesson;
    progress_pct: number;
  } | null;
  daily_challenge: Assessment | null;
  subject_progress: {
    subject: Subject;
    progress_pct: number;
    trend: number;
  }[];
  weak_areas: {
    concept: string;
    subject: string;
  }[];
  active_competition: Competition | null;
  recent_achievements: UserAchievement[];
  streak: {
    current: number;
    longest: number;
    today_complete: boolean;
  };
  recent_xp: number;
}
