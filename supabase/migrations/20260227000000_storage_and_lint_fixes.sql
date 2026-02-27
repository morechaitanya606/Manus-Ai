-- Fix function search_path warnings
ALTER FUNCTION public.update_updated_at() SET search_path = '';
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.sync_design_likes_count() SET search_path = '';

-- Fix overly permissive RLS policy on profiles for INSERT
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

CREATE POLICY "Service role can insert profiles"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create required storage buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('community', 'community', true),
  ('drop', 'drop', true),
  ('shop', 'shop', true),
  ('gallery', 'gallery', true),
  ('user-designs', 'user-designs', true),
  ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up basic access policies for the new buckets

-- Allow public read access to all these buckets
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('community', 'drop', 'shop', 'gallery', 'user-designs', 'product-images')
);

-- Allow authenticated users to upload to these buckets
CREATE POLICY "Authenticated users can upload objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('community', 'drop', 'shop', 'gallery', 'user-designs', 'product-images')
);

-- Allow authenticated users to update their own objects
CREATE POLICY "Authenticated users can update own objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('community', 'drop', 'shop', 'gallery', 'user-designs', 'product-images') AND 
  owner = auth.uid()
);

-- Allow authenticated users to delete their own objects
CREATE POLICY "Authenticated users can delete own objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('community', 'drop', 'shop', 'gallery', 'user-designs', 'product-images') AND 
  owner = auth.uid()
);
