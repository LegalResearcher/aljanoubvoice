-- Create posts table for news articles
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  author TEXT DEFAULT 'المحرر',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read posts (public website)
CREATE POLICY "Anyone can read posts"
ON public.posts
FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert posts (admin)
CREATE POLICY "Authenticated users can insert posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update posts (admin)
CREATE POLICY "Authenticated users can update posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete posts (admin)
CREATE POLICY "Authenticated users can delete posts"
ON public.posts
FOR DELETE
TO authenticated
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read images
CREATE POLICY "Anyone can read post images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'post-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'post-images');