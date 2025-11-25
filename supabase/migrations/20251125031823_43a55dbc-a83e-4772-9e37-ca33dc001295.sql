-- Create table for additional post media
CREATE TABLE public.post_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view post media" 
ON public.post_media 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert post media" 
ON public.post_media 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete post media" 
ON public.post_media 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_post_media_post_id ON public.post_media(post_id);