-- ============================================================================
-- WorthScope — WIPE ALL TEST ACCOUNTS + DATA
-- Run in the Supabase SQL Editor (project iftqcqpbcioyzrhqvgvc) ONLY.
-- This permanently deletes EVERY user, their data, and their files.
-- Idempotent: safe to run more than once (DELETE on empty tables = 0 rows).
--
-- NOTE on tables: this database's user-scoped tables are exactly the ones
-- below. `user_assessments` and `user_skills` from the original spec DO NOT
-- exist in this schema, so they are intentionally omitted — including them
-- would make the script error (and the spec forbids IF EXISTS guards).
-- `jobs_curated` is a shared/global job cache (not per-user) and is left alone.
-- ============================================================================

BEGIN;

-- 1. Tables that reference public.profiles — delete BEFORE profiles.
DELETE FROM public.parent_invites;
DELETE FROM public.student_state;

-- 2. Tables that reference auth.users.
DELETE FROM public.notifications;
DELETE FROM public.mission_lessons;
DELETE FROM public.mission_projects;
DELETE FROM public.koko_roadmaps;
DELETE FROM public.user_roles;

-- 3. Profiles (parent of step-1 tables, child of auth.users).
DELETE FROM public.profiles;

-- 4. Storage objects in the profile-pictures bucket.
DELETE FROM storage.objects WHERE bucket_id = 'profile-pictures';

-- 5. Auth users themselves (cascades any rows missed above).
DELETE FROM auth.users;

COMMIT;

-- 6. Confirm zero remaining rows everywhere.
SELECT 'notifications'             AS source, count(*) AS remaining FROM public.notifications
UNION ALL SELECT 'mission_lessons',          count(*) FROM public.mission_lessons
UNION ALL SELECT 'mission_projects',         count(*) FROM public.mission_projects
UNION ALL SELECT 'koko_roadmaps',            count(*) FROM public.koko_roadmaps
UNION ALL SELECT 'user_roles',               count(*) FROM public.user_roles
UNION ALL SELECT 'parent_invites',           count(*) FROM public.parent_invites
UNION ALL SELECT 'student_state',            count(*) FROM public.student_state
UNION ALL SELECT 'profiles',                 count(*) FROM public.profiles
UNION ALL SELECT 'profile_pictures_objects', count(*) FROM storage.objects WHERE bucket_id = 'profile-pictures'
UNION ALL SELECT 'auth_users',               count(*) FROM auth.users
ORDER BY source;
