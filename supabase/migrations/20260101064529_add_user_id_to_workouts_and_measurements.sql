/*
  # Add user authentication to workouts and body measurements

  ## Overview
  This migration adds user_id columns to link workouts and body measurements to authenticated users,
  and updates RLS policies to ensure users can only access their own data.

  ## Changes

  ### 1. Add user_id columns
    - Add `user_id` to `workouts` table (references auth.users)
    - Add `user_id` to `body_measurements` table (references auth.users)
    - Add indexes for faster queries

  ### 2. Update RLS Policies
    - Drop existing public policies
    - Create user-specific policies for authenticated users only
    - Users can only view, create, update, and delete their own data

  ## Security
    - All data is now user-scoped
    - Unauthenticated users have no access
    - Users cannot access other users' data
*/

-- Add user_id column to workouts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workouts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
  END IF;
END $$;

-- Add user_id column to body_measurements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'body_measurements' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE body_measurements ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS body_measurements_user_id_idx ON body_measurements(user_id);
  END IF;
END $$;

-- Drop old public policies for workouts
DROP POLICY IF EXISTS "Allow public read access to workouts" ON workouts;
DROP POLICY IF EXISTS "Allow public insert access to workouts" ON workouts;
DROP POLICY IF EXISTS "Allow public update access to workouts" ON workouts;
DROP POLICY IF EXISTS "Allow public delete access to workouts" ON workouts;

-- Create new user-specific policies for workouts
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop old public policies for workout_exercises
DROP POLICY IF EXISTS "Allow public read access to workout_exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Allow public insert access to workout_exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Allow public update access to workout_exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Allow public delete access to workout_exercises" ON workout_exercises;

-- Create new user-specific policies for workout_exercises
CREATE POLICY "Users can view own workout exercises"
  ON workout_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workout exercises"
  ON workout_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout exercises"
  ON workout_exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout exercises"
  ON workout_exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Drop old public policy for body_measurements
DROP POLICY IF EXISTS "Allow all operations for now" ON body_measurements;

-- Create new user-specific policies for body_measurements
CREATE POLICY "Users can view own measurements"
  ON body_measurements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
  ON body_measurements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
  ON body_measurements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
  ON body_measurements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
