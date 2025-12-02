-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can update posts" ON public.posts;

-- Create new policy: Allow admins and editors to insert posts
CREATE POLICY "Admins and editors can insert posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role)
);

-- Create new policy: Allow admins and editors to update posts
CREATE POLICY "Admins and editors can update posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role)
);