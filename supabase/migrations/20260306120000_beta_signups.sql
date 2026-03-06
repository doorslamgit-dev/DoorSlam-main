-- Beta signup collection table for doorslam.io holding page
CREATE TABLE IF NOT EXISTS public.beta_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'student', 'teacher')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Allow anonymous inserts (public landing page, no auth)
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up for beta"
  ON public.beta_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admins can read signups
CREATE POLICY "Admins can read beta signups"
  ON public.beta_signups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
