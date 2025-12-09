-- =============================================
-- RLS POLICIES FOR ARCHIBIT LMS
-- Run this in Supabase SQL Editor after prisma db push
--Updated to avoid recursion using security definer function
-- =============================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuizMarker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ViewingLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuizAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Certificate" ENABLE ROW LEVEL SECURITY;

-- Create helper function for admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public."User"
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USER POLICIES
-- =============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (id = auth.uid()::text);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (id = auth.uid()::text);

-- Allow insert during signup (service role handles this, but client might need passing check)
DROP POLICY IF EXISTS "Allow insert during signup" ON "User";
CREATE POLICY "Allow insert during signup" ON "User"
  FOR INSERT WITH CHECK (id = auth.uid()::text);

-- Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON "User";
CREATE POLICY "Admins can view all users" ON "User"
  FOR SELECT USING (is_admin());

-- =============================================
-- COURSE POLICIES
-- =============================================

-- Everyone can view courses (public catalog)
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON "Course";
CREATE POLICY "Courses are viewable by everyone" ON "Course"
  FOR SELECT USING (true);

-- Only admins can create/update/delete courses
DROP POLICY IF EXISTS "Admins can manage courses" ON "Course";
CREATE POLICY "Admins can manage courses" ON "Course"
  FOR ALL USING (is_admin());

-- =============================================
-- LESSON POLICIES
-- =============================================

-- Enrolled users can view lessons
DROP POLICY IF EXISTS "Enrolled users can view lessons" ON "Lesson";
CREATE POLICY "Enrolled users can view lessons" ON "Lesson"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Enrollment" 
      WHERE "userId" = auth.uid()::text 
      AND "courseId" = "Lesson"."courseId"
    )
    OR is_admin()
  );

-- Admins can manage lessons
DROP POLICY IF EXISTS "Admins can manage lessons" ON "Lesson";
CREATE POLICY "Admins can manage lessons" ON "Lesson"
  FOR ALL USING (is_admin());

-- =============================================
-- QUIZ MARKER POLICIES
-- =============================================

-- Enrolled users can view quiz markers
DROP POLICY IF EXISTS "Enrolled users can view quiz markers" ON "QuizMarker";
CREATE POLICY "Enrolled users can view quiz markers" ON "QuizMarker"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Enrollment" e
      JOIN "Lesson" l ON l."courseId" = e."courseId"
      WHERE e."userId" = auth.uid()::text 
      AND l.id = "QuizMarker"."lessonId"
    )
    OR is_admin()
  );

-- Admins can manage quiz markers
DROP POLICY IF EXISTS "Admins can manage quiz markers" ON "QuizMarker";
CREATE POLICY "Admins can manage quiz markers" ON "QuizMarker"
  FOR ALL USING (is_admin());

-- =============================================
-- ENROLLMENT POLICIES
-- =============================================

-- Users can view their own enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON "Enrollment";
CREATE POLICY "Users can view own enrollments" ON "Enrollment"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Users can create their own enrollments
DROP POLICY IF EXISTS "Users can create own enrollments" ON "Enrollment";
CREATE POLICY "Users can create own enrollments" ON "Enrollment"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

-- Admins can view all enrollments
DROP POLICY IF EXISTS "Admins can view all enrollments" ON "Enrollment";
CREATE POLICY "Admins can view all enrollments" ON "Enrollment"
  FOR SELECT USING (is_admin());

-- =============================================
-- PURCHASE POLICIES
-- =============================================

-- Users can view their own purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON "Purchase";
CREATE POLICY "Users can view own purchases" ON "Purchase"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Users can create their own purchases
DROP POLICY IF EXISTS "Users can create own purchases" ON "Purchase";
CREATE POLICY "Users can create own purchases" ON "Purchase"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

-- Admins can view all purchases
DROP POLICY IF EXISTS "Admins can view all purchases" ON "Purchase";
CREATE POLICY "Admins can view all purchases" ON "Purchase"
  FOR SELECT USING (is_admin());

-- =============================================
-- VIEWING LOG POLICIES
-- =============================================

-- Users manage own viewing logs
DROP POLICY IF EXISTS "Users manage own viewing logs" ON "ViewingLog";
CREATE POLICY "Users manage own viewing logs" ON "ViewingLog"
  FOR ALL USING ("userId" = auth.uid()::text);

-- Admins can view all viewing logs
DROP POLICY IF EXISTS "Admins can view all viewing logs" ON "ViewingLog";
CREATE POLICY "Admins can view all viewing logs" ON "ViewingLog"
  FOR SELECT USING (is_admin());

-- =============================================
-- QUIZ ATTEMPT POLICIES
-- =============================================

-- Users can manage their own quiz attempts
DROP POLICY IF EXISTS "Users manage own quiz attempts" ON "QuizAttempt";
CREATE POLICY "Users manage own quiz attempts" ON "QuizAttempt"
  FOR ALL USING ("userId" = auth.uid()::text);

-- Admins can view all quiz attempts
DROP POLICY IF EXISTS "Admins can view all quiz attempts" ON "QuizAttempt"
  FOR SELECT USING (is_admin());

-- =============================================
-- CERTIFICATE POLICIES
-- =============================================

-- Users can view their own certificates
DROP POLICY IF EXISTS "Users can view own certificates" ON "Certificate";
CREATE POLICY "Users can view own certificates" ON "Certificate"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Admins can manage all certificates
DROP POLICY IF EXISTS "Admins can manage certificates" ON "Certificate";
CREATE POLICY "Admins can manage certificates" ON "Certificate"
  FOR ALL USING (is_admin());
