/*
  # Create Workouts Tables

  ## Overview
  This migration creates the database structure for storing workout sessions and exercises.

  ## New Tables
  
  ### `workouts`
  Main workout sessions table
  - `id` (uuid, primary key) - Unique identifier for each workout
  - `date` (timestamptz) - Date and time when workout was performed
  - `body_parts` (text[]) - Array of body parts trained (e.g., ['Chest', 'Back'])
  - `duration` (integer) - Duration in minutes (optional)
  - `notes` (text) - Optional workout notes
  - `created_at` (timestamptz) - Timestamp when record was created

  ### `workout_exercises`
  Individual exercises performed in each workout
  - `id` (uuid, primary key) - Unique identifier
  - `workout_id` (uuid, foreign key) - References workouts.id
  - `exercise_name` (text) - Name of the exercise
  - `body_part` (text) - Body part targeted
  - `sets` (integer) - Number of sets performed
  - `reps` (integer) - Number of reps per set
  - `weight` (numeric) - Weight used (optional)
  - `completed` (boolean) - Whether exercise was completed
  - `created_at` (timestamptz) - Timestamp when record was created

  ## Security
  - Enable RLS on both tables
  - Public access for now (can be restricted later with auth)

  ## Important Notes
  1. Uses UUID for primary keys for scalability
  2. Timestamps use timestamptz for proper timezone handling
  3. Arrays used for body_parts for flexible storage
  4. Foreign key constraint ensures data integrity
*/

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz DEFAULT now() NOT NULL,
  body_parts text[] DEFAULT '{}' NOT NULL,
  duration integer,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name text NOT NULL,
  body_part text NOT NULL,
  sets integer DEFAULT 0 NOT NULL,
  reps integer DEFAULT 0 NOT NULL,
  weight numeric,
  completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS workout_exercises_workout_id_idx ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS workouts_date_idx ON workouts(date DESC);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (can be restricted later)
CREATE POLICY "Allow public read access to workouts"
  ON workouts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to workouts"
  ON workouts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to workouts"
  ON workouts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to workouts"
  ON workouts FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to workout_exercises"
  ON workout_exercises FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to workout_exercises"
  ON workout_exercises FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to workout_exercises"
  ON workout_exercises FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to workout_exercises"
  ON workout_exercises FOR DELETE
  TO public
  USING (true);
