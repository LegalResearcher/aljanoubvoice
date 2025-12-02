-- Drop the existing check constraint
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_status_check;

-- Add new check constraint with all status values including under_review
ALTER TABLE public.posts 
ADD CONSTRAINT posts_status_check 
CHECK (status IN ('published', 'draft', 'scheduled', 'under_review', 'hidden'));