-- Update user password using admin privileges
-- This will reset the password for moieen2013@gmail.com

DO $$
DECLARE
  user_uuid UUID := '2cccefcb-faea-43b4-8892-efffc89c1c96';
BEGIN
  -- Update password hash for the user
  -- Password: Mlak381072
  UPDATE auth.users
  SET 
    encrypted_password = crypt('Mlak381072', gen_salt('bf')),
    updated_at = now()
  WHERE id = user_uuid;
END $$;