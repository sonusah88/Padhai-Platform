-- =============================================================================
-- PADHAI — Nepal-First Education Platform
-- Database Schema — Phase 1 MVP
-- =============================================================================
-- Run against PostgreSQL (Supabase)
-- This creates all tables, indexes, and RLS policies.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search with trigrams

-- =============================================================================
-- USERS & PROFILES
-- =============================================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent', 'content_manager', 'admin', 'super_admin')),
  grade_id UUID,
  school TEXT,
  district TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_current INTEGER NOT NULL DEFAULT 0,
  streak_longest INTEGER NOT NULL DEFAULT 0,
  streak_last_date DATE,
  streak_freeze_remaining INTEGER NOT NULL DEFAULT 2,
  settings JSONB NOT NULL DEFAULT '{
    "locale": "en",
    "theme": "system",
    "data_saver": false,
    "notifications_email": true,
    "notifications_push": true,
    "daily_goal_minutes": 30,
    "privacy_show_profile": true,
    "privacy_show_leaderboard": true
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_grade ON profiles(grade_id);
CREATE INDEX idx_profiles_district ON profiles(district);

-- Student profiles
CREATE TABLE student_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  grade_id UUID,
  interests TEXT[] DEFAULT '{}',
  preparing_for TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false
);

-- Teacher profiles
CREATE TABLE teacher_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  qualifications TEXT[] DEFAULT '{}'
);

-- Parent profiles
CREATE TABLE parent_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  linked_student_ids UUID[] DEFAULT '{}'
);

-- =============================================================================
-- CURRICULUM
-- =============================================================================

CREATE TABLE education_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Nepal'
);

CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id UUID REFERENCES education_systems(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_ne TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_grades_system ON grades(system_id);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ne TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT 'book-open',
  color TEXT DEFAULT '#2563be'
);

CREATE TABLE grade_subjects (
  grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (grade_id, subject_id)
);

CREATE TABLE curriculum_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  grade_id UUID REFERENCES grades(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_ne TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_units_subject_grade ON curriculum_units(subject_id, grade_id);

CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES curriculum_units(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_ne TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_chapters_unit ON chapters(unit_id);

CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  prerequisites UUID[] DEFAULT '{}'
);

CREATE INDEX idx_concepts_chapter ON concepts(chapter_id);

-- =============================================================================
-- COURSES & LESSONS
-- =============================================================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT NOT NULL UNIQUE,
  instructor_id UUID REFERENCES profiles(id) NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  prerequisites UUID[] DEFAULT '{}',
  is_free BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  grade_id UUID REFERENCES grades(id),
  subject_id UUID REFERENCES subjects(id),
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_grade_subject ON courses(grade_id, subject_id);

-- Full-text search on courses
CREATE INDEX idx_courses_search ON courses USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(category, '')));

CREATE TABLE course_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_sections_course ON course_sections(course_id);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'article', 'pdf', 'quiz', 'assignment', 'interactive', 'coding', 'discussion', 'live')),
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  concept_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived'))
);

CREATE INDEX idx_lessons_section ON lessons(section_id);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  size_bytes BIGINT
);

CREATE INDEX idx_resources_lesson ON resources(lesson_id);
CREATE INDEX idx_resources_course ON resources(course_id);

-- =============================================================================
-- ASSESSMENTS
-- =============================================================================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'mcq' CHECK (type IN ('mcq', 'true_false', 'fill_blank', 'numerical', 'matching', 'ordering', 'short_answer', 'coding', 'image_based')),
  text TEXT NOT NULL,
  text_ne TEXT,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  subject_id UUID REFERENCES subjects(id),
  grade_id UUID REFERENCES grades(id),
  chapter_id UUID REFERENCES chapters(id),
  concept_id UUID REFERENCES concepts(id),
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  marks INTEGER NOT NULL DEFAULT 1,
  time_seconds INTEGER NOT NULL DEFAULT 60,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_subject_grade ON questions(subject_id, grade_id);
CREATE INDEX idx_questions_chapter ON questions(chapter_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'quiz' CHECK (type IN ('quiz', 'chapter_test', 'mock_exam', 'practice', 'daily_challenge', 'weekly_challenge', 'competition')),
  course_id UUID REFERENCES courses(id),
  chapter_id UUID REFERENCES chapters(id),
  subject_id UUID REFERENCES subjects(id),
  grade_id UUID REFERENCES grades(id),
  time_limit_minutes INTEGER,
  total_marks INTEGER NOT NULL DEFAULT 0,
  question_ids UUID[] NOT NULL DEFAULT '{}',
  pass_percentage INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_course ON assessments(course_id);
CREATE INDEX idx_assessments_type ON assessments(type);

CREATE TABLE assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score INTEGER,
  total INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  analysis JSONB
);

CREATE INDEX idx_attempts_user ON assessment_attempts(user_id);
CREATE INDEX idx_attempts_assessment ON assessment_attempts(assessment_id);
CREATE INDEX idx_attempts_user_assessment ON assessment_attempts(user_id, assessment_id);

-- =============================================================================
-- LIVE SESSIONS
-- =============================================================================

CREATE TABLE live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES profiles(id) NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  grade_id UUID REFERENCES grades(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  stream_key TEXT,
  playback_url TEXT,
  recording_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  resources TEXT[] DEFAULT '{}',
  max_participants INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_live_scheduled ON live_sessions(scheduled_at);
CREATE INDEX idx_live_instructor ON live_sessions(instructor_id);
CREATE INDEX idx_live_status ON live_sessions(status);

CREATE TABLE live_attendance (
  session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (session_id, user_id)
);

-- =============================================================================
-- COMPETITIONS
-- =============================================================================

CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'weekly' CHECK (type IN ('daily', 'weekly', 'subject_tournament', 'improvement', 'skill', 'inter_school')),
  subject_id UUID REFERENCES subjects(id),
  grade_id UUID REFERENCES grades(id),
  assessment_id UUID REFERENCES assessments(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  rules TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  max_participants INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_dates ON competitions(start_at, end_at);

CREATE TABLE competition_participants (
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  improvement_pct NUMERIC(5,2),
  submitted_at TIMESTAMPTZ,
  PRIMARY KEY (competition_id, user_id)
);

-- =============================================================================
-- PROGRESS & GAMIFICATION
-- =============================================================================

CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_pct INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_progress_user ON learning_progress(user_id);
CREATE INDEX idx_progress_user_course ON learning_progress(user_id, course_id);
CREATE INDEX idx_progress_user_lesson ON learning_progress(user_id, lesson_id);

CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_user_date ON xp_transactions(user_id, created_at);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ne TEXT,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  criteria JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ne TEXT,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '⭐'
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE NOT read;

-- =============================================================================
-- REPORTS & MODERATION
-- =============================================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public profiles are visible" ON profiles FOR SELECT USING ((settings->>'privacy_show_profile')::boolean = true);

-- Courses: published are public, drafts only by owner/admin
CREATE POLICY "Published courses are public" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "Instructors can manage own courses" ON courses FOR ALL USING (instructor_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Lessons: published course lessons are viewable
CREATE POLICY "Published lessons are viewable" ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_sections cs
    JOIN courses c ON c.id = cs.course_id
    WHERE cs.id = lessons.section_id AND c.status = 'published'
  )
);

-- Assessment attempts: own data only
CREATE POLICY "Users see own attempts" ON assessment_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create own attempts" ON assessment_attempts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own attempts" ON assessment_attempts FOR UPDATE USING (user_id = auth.uid());

-- Learning progress: own data only
CREATE POLICY "Users see own progress" ON learning_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own progress" ON learning_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users modify own progress" ON learning_progress FOR UPDATE USING (user_id = auth.uid());

-- XP: own data only
CREATE POLICY "Users see own XP" ON xp_transactions FOR SELECT USING (user_id = auth.uid());

-- Notifications: own data only
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Live sessions: published are public
CREATE POLICY "Live sessions are public" ON live_sessions FOR SELECT USING (status != 'cancelled');

-- Competitions: published are public
CREATE POLICY "Published competitions are public" ON competitions FOR SELECT USING (status = 'published');

-- Published resources are public
CREATE POLICY "Resources are viewable" ON resources FOR SELECT USING (true);

-- Published questions/assessments
CREATE POLICY "Published assessments are viewable" ON assessments FOR SELECT USING (status = 'published');
CREATE POLICY "Published questions are viewable" ON questions FOR SELECT USING (true);

-- Curriculum tables are public read
ALTER TABLE education_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculum is public" ON education_systems FOR SELECT USING (true);
CREATE POLICY "Grades are public" ON grades FOR SELECT USING (true);
CREATE POLICY "Subjects are public" ON subjects FOR SELECT USING (true);
CREATE POLICY "Grade subjects are public" ON grade_subjects FOR SELECT USING (true);
CREATE POLICY "Units are public" ON curriculum_units FOR SELECT USING (true);
CREATE POLICY "Chapters are public" ON chapters FOR SELECT USING (true);
CREATE POLICY "Concepts are public" ON concepts FOR SELECT USING (true);
CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);
CREATE POLICY "User achievements are viewable" ON user_achievements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Badges are public" ON badges FOR SELECT USING (true);
CREATE POLICY "User badges are viewable" ON user_badges FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
