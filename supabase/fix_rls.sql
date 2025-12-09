-- =============================================
-- FIX RLS INFINITE RECURSION
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create helper function to check admin status securely (bypassing RLS)
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

-- 2. Drop ALL policies that use the recursive admin check
DROP POLICY IF EXISTS "Admins can view all users" ON "User";
DROP POLICY IF EXISTS "Admins can manage courses" ON "Course";
DROP POLICY IF EXISTS "Enrolled users can view lessons" ON "Lesson";
DROP POLICY IF EXISTS "Admins can manage lessons" ON "Lesson";
DROP POLICY IF EXISTS "Enrolled users can view quiz markers" ON "QuizMarker";
DROP POLICY IF EXISTS "Admins can manage quiz markers" ON "QuizMarker";
DROP POLICY IF EXISTS "Admins can view all enrollments" ON "Enrollment";
DROP POLICY IF EXISTS "Admins can view all purchases" ON "Purchase";
DROP POLICY IF EXISTS "Admins can view all viewing logs" ON "ViewingLog";
DROP POLICY IF EXISTS "Admins can view all quiz attempts" ON "QuizAttempt";
DROP POLICY IF EXISTS "Admins can manage certificates" ON "Certificate";

-- 3. Re-create policies using is_admin() function

-- User
CREATE POLICY "Admins can view all users" ON "User"
  FOR SELECT USING (is_admin());

-- Course
CREATE POLICY "Admins can manage courses" ON "Course"
  FOR ALL USING (is_admin());

-- Lesson
CREATE POLICY "Enrolled users can view lessons" ON "Lesson"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Enrollment" 
      WHERE "userId" = auth.uid()::text 
      AND "courseId" = "Lesson"."courseId"
    )
    OR is_admin()
  );

CREATE POLICY "Admins can manage lessons" ON "Lesson"
  FOR ALL USING (is_admin());

-- QuizMarker
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

CREATE POLICY "Admins can manage quiz markers" ON "QuizMarker"
  FOR ALL USING (is_admin());

-- Enrollment
CREATE POLICY "Admins can view all enrollments" ON "Enrollment"
  FOR SELECT USING (is_admin());

-- Purchase
CREATE POLICY "Admins can view all purchases" ON "Purchase"
  FOR SELECT USING (is_admin());

-- ViewingLog
CREATE POLICY "Admins can view all viewing logs" ON "ViewingLog"
  FOR SELECT USING (is_admin());

-- QuizAttempt
CREATE POLICY "Admins can view all quiz attempts" ON "QuizAttempt"
  FOR SELECT USING (is_admin());

-- Certificate
CREATE POLICY "Admins can manage certificates" ON "Certificate"
  FOR ALL USING (is_admin());
