/*
  # Create AI Workout Plans Table

  ## Overview
  This migration creates a table for storing AI-generated workout plans with user preferences
  and the complete generated plan data.

  ## New Tables

  ### `ai_workout_plans`
  Stores AI-generated workout plans for users
  - `id` (uuid, primary key) - Unique identifier for each plan
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `title` (text) - Plan title/name
  - `goal` (text) - Fitness goal (fat loss, muscle gain, strength, endurance)
  - `experience_level` (text) - User experience level (beginner, intermediate, advanced)
  - `days_per_week` (integer) - Number of training days per week
  - `available_equipment` (text[]) - Array of available equipment
  - `injuries_limitations` (text) - Any injuries or limitations
  - `plan_data` (jsonb) - Complete plan data including weekly schedule
  - `created_at` (timestamptz) - When the plan was generated

  ## Security
  - Enable RLS on `ai_workout_plans` table
  - Users can only view, create, update, and delete their own plans
  - All operations require authentication

  ## Important Notes
  1. Uses JSONB for flexible plan data storage
  2. Indexes added for performance on user queries
  3. Foreign key ensures data integrity with user accounts
*/

-- Create ai_workout_plans table
CREATE TABLE IF NOT EXISTS ai_workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  goal text NOT NULL,
  experience_level text NOT NULL,
  days_per_week integer NOT NULL DEFAULT 3,
  available_equipment text[] DEFAULT '{}' NOT NULL,
  injuries_limitations text,
  plan_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS ai_workout_plans_user_id_idx ON ai_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS ai_workout_plans_created_at_idx ON ai_workout_plans(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_workout_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for user-specific access
CREATE POLICY "Users can view own AI plans"
  ON ai_workout_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI plans"
  ON ai_workout_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI plans"
  ON ai_workout_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI plans"
  ON ai_workout_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
