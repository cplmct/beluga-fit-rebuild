/*
  # Create Account Deletion Function

  1. Function
    - `delete_user()` - Securely deletes the authenticated user's account
    - Deletes user data from related tables (workouts, measurements, AI plans, exercises)
    - Deletes the user from auth.users table
    - Can only be called by authenticated users
    - Only allows users to delete their own account

  2. Security
    - Function executes with SECURITY DEFINER to access auth schema
    - Validates user is authenticated
    - Prevents users from deleting other accounts
    - Cascades deletions to all related data

  3. Tables Affected
    - profiles (already handled by RLS)
    - workouts
    - workout_exercises
    - body_measurements
    - ai_workout_plans
    - auth.users (requires special privileges)
*/

-- Create function to delete user account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_user_id uuid;
BEGIN
  -- Get the current user's ID
  deleted_user_id := auth.uid();

  -- Check if user is authenticated
  IF deleted_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Delete workout exercises first (foreign key dependency)
  DELETE FROM workout_exercises
  WHERE workout_id IN (
    SELECT id FROM workouts WHERE user_id = deleted_user_id
  );

  -- Delete workouts
  DELETE FROM workouts WHERE user_id = deleted_user_id;

  -- Delete body measurements
  DELETE FROM body_measurements WHERE user_id = deleted_user_id;

  -- Delete AI workout plans
  DELETE FROM ai_workout_plans WHERE user_id = deleted_user_id;

  -- Delete profile (will be done by application, but just in case)
  DELETE FROM profiles WHERE id = deleted_user_id;

  -- Delete user from auth.users (requires admin privileges)
  DELETE FROM auth.users WHERE id = deleted_user_id;

  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
