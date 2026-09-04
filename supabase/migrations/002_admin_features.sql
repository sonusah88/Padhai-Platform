-- =============================================================================
-- PADHAI — Nepal-First Education Platform
-- Database Schema — Phase 2 Admin, Content & Zoom Live Classes
-- =============================================================================
-- Run against PostgreSQL (Supabase)
-- This creates admin roles helpers, content management tables, live_classes,
-- storage buckets, and comprehensive Row Level Security (RLS) policies.

-- =============================================================================
-- 1. SECURITY HELPER FUNCTIONS (FOR RLS)
-- =============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'teacher')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 2. PROFILE POLICIES (ADMIN MANAGEMENT)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are visible" ON profiles;

CREATE POLICY "Users and admins can view profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id 
    OR is_admin() 
    OR (settings->>'privacy_show_profile')::boolean = true
  );

CREATE POLICY "Users can update own profile and admins can update all" ON profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR is_admin()
  );

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    is_admin()
  );

-- =============================================================================
-- 3. RECORDED VIDEOS (VOD)
-- =============================================================================

CREATE TABLE IF NOT EXISTS recorded_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recorded_videos_subject ON recorded_videos(subject_id);
CREATE INDEX IF NOT EXISTS idx_recorded_videos_grade ON recorded_videos(grade_id);
CREATE INDEX IF NOT EXISTS idx_recorded_videos_status ON recorded_videos(status);
CREATE INDEX IF NOT EXISTS idx_recorded_videos_uploaded_by ON recorded_videos(uploaded_by);

-- =============================================================================
-- 4. STUDY MATERIALS (PDFs, DOCs, NOTES)
-- =============================================================================

CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_grade ON study_materials(grade_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_uploaded_by ON study_materials(uploaded_by);

-- =============================================================================
-- 5. QUIZZES (DYNAMIC QUIZ BUILDER)
-- =============================================================================

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,
  time_limit_minutes INTEGER DEFAULT 15,
  total_marks INTEGER NOT NULL DEFAULT 0,
  pass_percentage INTEGER DEFAULT 40,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_grade ON quizzes(grade_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);

-- =============================================================================
-- 6. LIVE CLASSES (ZOOM INTEGRATION)
-- =============================================================================

CREATE TABLE IF NOT EXISTS live_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_id TEXT NOT NULL,
  passcode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_classes_teacher ON live_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_scheduled ON live_classes(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE recorded_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;

-- Recorded Videos Policies
CREATE POLICY "Public can view published recorded videos" ON recorded_videos
  FOR SELECT USING (status = 'published' OR is_admin_or_teacher());

CREATE POLICY "Admins and teachers can insert recorded videos" ON recorded_videos
  FOR INSERT WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Admins and teachers can update recorded videos" ON recorded_videos
  FOR UPDATE USING (is_admin_or_teacher());

CREATE POLICY "Admins and teachers can delete recorded videos" ON recorded_videos
  FOR DELETE USING (is_admin_or_teacher());

-- Study Materials Policies
CREATE POLICY "Public can view study materials" ON study_materials
  FOR SELECT USING (true);

CREATE POLICY "Admins and teachers can insert study materials" ON study_materials
  FOR INSERT WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Admins and teachers can update study materials" ON study_materials
  FOR UPDATE USING (is_admin_or_teacher());

CREATE POLICY "Admins and teachers can delete study materials" ON study_materials
  FOR DELETE USING (is_admin_or_teacher());

-- Quizzes Policies
CREATE POLICY "Public can view published quizzes" ON quizzes
  FOR SELECT USING (status = 'published' OR is_admin_or_teacher());

CREATE POLICY "Admins and teachers can insert quizzes" ON quizzes
  FOR INSERT WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Admins and teachers can update quizzes" ON quizzes
  FOR UPDATE USING (is_admin_or_teacher());

CREATE POLICY "Admins and teachers can delete quizzes" ON quizzes
  FOR DELETE USING (is_admin_or_teacher());

-- Live Classes Policies
CREATE POLICY "Public can view live classes" ON live_classes
  FOR SELECT USING (status != 'cancelled' OR is_admin_or_teacher());

CREATE POLICY "Admins and teachers can insert live classes" ON live_classes
  FOR INSERT WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Admins and teachers can update live classes" ON live_classes
  FOR UPDATE USING (is_admin_or_teacher());

CREATE POLICY "Admins and teachers can delete live classes" ON live_classes
  FOR DELETE USING (is_admin_or_teacher());

-- =============================================================================
-- 8. STORAGE BUCKETS CONFIGURATION
-- =============================================================================

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('videos', 'videos', true),
  ('study_materials', 'study_materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS
CREATE POLICY "Public access to videos bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Public access to study materials bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'study_materials');

CREATE POLICY "Admins and teachers can upload videos to storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND is_admin_or_teacher()
  );

CREATE POLICY "Admins and teachers can upload materials to storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'study_materials' AND is_admin_or_teacher()
  );

CREATE POLICY "Admins and teachers can update/delete stored files" ON storage.objects
  FOR ALL USING (
    bucket_id IN ('videos', 'study_materials') AND is_admin_or_teacher()
  );

-- =============================================================================
-- 9. TRIGGERS FOR updated_at
-- =============================================================================

CREATE TRIGGER recorded_videos_updated_at
  BEFORE UPDATE ON recorded_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER study_materials_updated_at
  BEFORE UPDATE ON study_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER live_classes_updated_at
  BEFORE UPDATE ON live_classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
