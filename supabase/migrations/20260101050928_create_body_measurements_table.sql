/*
  # Create body measurements table

  1. New Tables
    - `body_measurements`
      - `id` (uuid, primary key) - Unique identifier for each measurement entry
      - `height` (numeric) - Height measurement
      - `weight` (numeric) - Weight measurement
      - `chest` (numeric) - Chest measurement
      - `waist` (numeric) - Waist measurement
      - `hips` (numeric) - Hips measurement
      - `left_arm` (numeric) - Left arm measurement
      - `right_arm` (numeric) - Right arm measurement
      - `left_thigh` (numeric) - Left thigh measurement
      - `right_thigh` (numeric) - Right thigh measurement
      - `left_calf` (numeric) - Left calf measurement
      - `right_calf` (numeric) - Right calf measurement
      - `neck` (numeric) - Neck measurement
      - `created_at` (timestamptz) - Timestamp when measurement was recorded

  2. Security
    - Enable RLS on `body_measurements` table
    - For now, allow all operations (will be restricted when auth is added)
*/

CREATE TABLE IF NOT EXISTS body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  height numeric,
  weight numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  left_arm numeric,
  right_arm numeric,
  left_thigh numeric,
  right_thigh numeric,
  left_calf numeric,
  right_calf numeric,
  neck numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for now"
  ON body_measurements
  FOR ALL
  USING (true)
  WITH CHECK (true);