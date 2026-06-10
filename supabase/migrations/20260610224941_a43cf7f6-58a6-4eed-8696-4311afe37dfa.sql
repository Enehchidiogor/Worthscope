
-- Anyone signed in can read profile pictures (avatars surfaced across the app)
CREATE POLICY "auth read profile pics" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profile-pictures');

-- Users may only write inside their own user_id folder
CREATE POLICY "user upload own profile pic" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "user update own profile pic" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "user delete own profile pic" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
