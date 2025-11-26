-- Create authors table for opinions section
CREATE TABLE public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  bio text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- RLS policies for authors
CREATE POLICY "Anyone can view authors" ON public.authors FOR SELECT USING (true);
CREATE POLICY "Only admins can insert authors" ON public.authors FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update authors" ON public.authors FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete authors" ON public.authors FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add new columns to posts table
ALTER TABLE public.posts
ADD COLUMN source text DEFAULT 'الجنوب فويس | خاص',
ADD COLUMN external_video_url text,
ADD COLUMN slug text UNIQUE,
ADD COLUMN meta_title text,
ADD COLUMN meta_description text,
ADD COLUMN keywords text[],
ADD COLUMN tags text[],
ADD COLUMN scheduled_at timestamp with time zone,
ADD COLUMN expires_at timestamp with time zone,
ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'hidden')),
ADD COLUMN views integer DEFAULT 0,
ADD COLUMN word_count integer DEFAULT 0,
ADD COLUMN reading_time integer DEFAULT 0,
ADD COLUMN author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL;

-- Add "عاجل" to categories by adding breaking news posts
-- (No enum change needed, we just use the category field)