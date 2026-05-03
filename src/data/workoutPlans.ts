export type PlanCategory =
  | 'weight-loss'
  | 'muscle-gain'
  | 'strength'
  | 'general-fitness'
  | 'beginner'
  | 'home';

export interface PlanExercise {
  name: string;
  bodyPart: string;
  sets: number;
  reps: string;
  equipment: string;
  notes?: string;
}

export interface PlanDay {
  label: string;
  title: string;
  focus: string;
  exercises: PlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  category: PlanCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  workoutsPerWeek: number;
  equipmentLevel: 'No Equipment' | 'Minimal Equipment' | 'Full Gym';
  description: string;
  days: PlanDay[];
}

export const PLAN_CATEGORIES: Record<
  PlanCategory,
  { label: string; color: string; accent: string }
> = {
  'weight-loss':      { label: 'Weight Loss',     color: '#dc2626', accent: '#fef2f2' },
  'muscle-gain':      { label: 'Muscle Gain',      color: '#2563eb', accent: '#eff6ff' },
  'strength':         { label: 'Strength',         color: '#7c3aed', accent: '#f5f3ff' },
  'general-fitness':  { label: 'General Fitness',  color: '#059669', accent: '#f0fdf4' },
  'beginner':         { label: 'Beginner',         color: '#d97706', accent: '#fffbeb' },
  'home':             { label: 'Home Workout',     color: '#0891b2', accent: '#ecfeff' },
};

export const WORKOUT_PLANS: WorkoutPlan[] = [
  // ─────────────────────────────────────────────────────────
  // WEIGHT LOSS
  // ─────────────────────────────────────────────────────────
  {
    id: 'fat-burn-circuit',
    title: 'Fat Burn Circuit',
    category: 'weight-loss',
    difficulty: 'Intermediate',
    durationWeeks: 8,
    workoutsPerWeek: 4,
    equipmentLevel: 'Minimal Equipment',
    description:
      'A structured 8-week program combining resistance circuits and cardio intervals to maximize calorie burn and preserve lean muscle. High-rep, moderate-weight sessions keep your heart rate elevated throughout.',
    days: [
      {
        label: 'Day 1',
        title: 'Upper Body Circuit',
        focus: 'Chest, Shoulders, Back',
        exercises: [
          { name: 'Push-ups', bodyPart: 'Chest', sets: 4, reps: '15', equipment: 'Bodyweight' },
          { name: 'Dumbbell Row', bodyPart: 'Back', sets: 4, reps: '12', equipment: 'Dumbbell', notes: 'Each side' },
          { name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders', sets: 3, reps: '12', equipment: 'Dumbbell' },
          { name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 3, reps: '15', equipment: 'Dumbbell' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '45 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Lower Body Burn',
        focus: 'Legs, Glutes, Core',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 4, reps: '15', equipment: 'Bodyweight' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Dumbbell', notes: 'Each leg' },
          { name: 'Romanian Deadlift', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Dumbbell' },
          { name: 'Calf Raises', bodyPart: 'Legs', sets: 3, reps: '20', equipment: 'Bodyweight' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 3',
        title: 'HIIT Cardio',
        focus: 'Full Body, Cardio',
        exercises: [
          { name: 'Jumping Jacks', bodyPart: 'Core', sets: 4, reps: '45 sec', equipment: 'Bodyweight', notes: '15 sec rest' },
          { name: 'Burpees', bodyPart: 'Core', sets: 4, reps: '10', equipment: 'Bodyweight' },
          { name: 'High Knees', bodyPart: 'Legs', sets: 4, reps: '40 sec', equipment: 'Bodyweight' },
          { name: 'Push-ups', bodyPart: 'Chest', sets: 3, reps: '12', equipment: 'Bodyweight' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '45 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 4',
        title: 'Full Body Finisher',
        focus: 'Total Body',
        exercises: [
          { name: 'Dumbbell Press', bodyPart: 'Chest', sets: 3, reps: '12', equipment: 'Dumbbell' },
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '15', equipment: 'Dumbbell' },
          { name: 'Dumbbell Row', bodyPart: 'Back', sets: 3, reps: '12', equipment: 'Dumbbell' },
          { name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 3, reps: '15', equipment: 'Dumbbell' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
    ],
  },
  {
    id: 'cardio-core',
    title: 'Cardio & Core',
    category: 'weight-loss',
    difficulty: 'Beginner',
    durationWeeks: 6,
    workoutsPerWeek: 3,
    equipmentLevel: 'No Equipment',
    description:
      'A gentle entry point for fat loss. Three sessions per week build cardiovascular endurance and core stability using only bodyweight. Ideal for those returning to fitness or starting fresh.',
    days: [
      {
        label: 'Day 1',
        title: 'Cardio Intervals',
        focus: 'Cardio, Core',
        exercises: [
          { name: 'Jumping Jacks', bodyPart: 'Core', sets: 3, reps: '60 sec', equipment: 'Bodyweight' },
          { name: 'High Knees', bodyPart: 'Legs', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 3, reps: '20 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Total Body Circuit',
        focus: 'Full Body',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '15', equipment: 'Bodyweight' },
          { name: 'Push-ups', bodyPart: 'Chest', sets: 3, reps: '10', equipment: 'Bodyweight', notes: 'Knee variation OK' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 2, reps: '10', equipment: 'Bodyweight', notes: 'Each leg' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '20 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Steady Cardio + Abs',
        focus: 'Core, Cardio',
        exercises: [
          { name: 'Jumping Jacks', bodyPart: 'Core', sets: 4, reps: '60 sec', equipment: 'Bodyweight' },
          { name: 'Burpees', bodyPart: 'Core', sets: 3, reps: '8', equipment: 'Bodyweight', notes: 'Modify as needed' },
          { name: 'Plank', bodyPart: 'Core', sets: 4, reps: '30 sec', equipment: 'Bodyweight' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // MUSCLE GAIN
  // ─────────────────────────────────────────────────────────
  {
    id: 'classic-hypertrophy',
    title: 'Classic Hypertrophy',
    category: 'muscle-gain',
    difficulty: 'Intermediate',
    durationWeeks: 12,
    workoutsPerWeek: 4,
    equipmentLevel: 'Full Gym',
    description:
      'A proven 4-day split designed for muscle growth. Each session targets a specific muscle group with sufficient volume and progressive overload. Rest 60–90 seconds between sets for optimal hypertrophy.',
    days: [
      {
        label: 'Day 1',
        title: 'Chest & Triceps',
        focus: 'Chest, Arms',
        exercises: [
          { name: 'Bench Press', bodyPart: 'Chest', sets: 4, reps: '8', equipment: 'Barbell' },
          { name: 'Incline Dumbbell Press', bodyPart: 'Chest', sets: 3, reps: '10', equipment: 'Dumbbell' },
          { name: 'Cable Fly', bodyPart: 'Chest', sets: 3, reps: '12', equipment: 'Cable' },
          { name: 'Tricep Pushdown', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Cable' },
          { name: 'Overhead Tricep Extension', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Dumbbell' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Back & Biceps',
        focus: 'Back, Arms',
        exercises: [
          { name: 'Deadlift', bodyPart: 'Back', sets: 4, reps: '6', equipment: 'Barbell' },
          { name: 'Pull-ups', bodyPart: 'Back', sets: 3, reps: '8', equipment: 'Bodyweight' },
          { name: 'Barbell Row', bodyPart: 'Back', sets: 3, reps: '10', equipment: 'Barbell' },
          { name: 'Barbell Curl', bodyPart: 'Arms', sets: 3, reps: '10', equipment: 'Barbell' },
          { name: 'Hammer Curl', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Dumbbell' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Shoulders & Core',
        focus: 'Shoulders, Core',
        exercises: [
          { name: 'Overhead Press', bodyPart: 'Shoulders', sets: 4, reps: '8', equipment: 'Barbell' },
          { name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 4, reps: '12', equipment: 'Dumbbell' },
          { name: 'Rear Delt Fly', bodyPart: 'Shoulders', sets: 3, reps: '15', equipment: 'Dumbbell' },
          { name: 'Shrugs', bodyPart: 'Shoulders', sets: 3, reps: '15', equipment: 'Dumbbell' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '60 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 4',
        title: 'Legs',
        focus: 'Quads, Hamstrings, Calves',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 4, reps: '8', equipment: 'Barbell' },
          { name: 'Romanian Deadlift', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Barbell' },
          { name: 'Leg Press', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Machine' },
          { name: 'Leg Curl', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Machine' },
          { name: 'Calf Raises', bodyPart: 'Legs', sets: 4, reps: '15', equipment: 'Machine' },
        ],
      },
    ],
  },
  {
    id: 'push-pull-legs',
    title: 'Push Pull Legs',
    category: 'muscle-gain',
    difficulty: 'Advanced',
    durationWeeks: 12,
    workoutsPerWeek: 6,
    equipmentLevel: 'Full Gym',
    description:
      'The most proven muscle-building split. Each muscle group is trained twice per week at high volume. Requires commitment and a solid training base. Not recommended for beginners.',
    days: [
      {
        label: 'Day 1',
        title: 'Push A',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { name: 'Bench Press', bodyPart: 'Chest', sets: 4, reps: '6', equipment: 'Barbell' },
          { name: 'Overhead Press', bodyPart: 'Shoulders', sets: 4, reps: '8', equipment: 'Barbell' },
          { name: 'Incline Dumbbell Press', bodyPart: 'Chest', sets: 3, reps: '10', equipment: 'Dumbbell' },
          { name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 3, reps: '15', equipment: 'Dumbbell' },
          { name: 'Tricep Pushdown', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Cable' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Pull A',
        focus: 'Back, Biceps',
        exercises: [
          { name: 'Deadlift', bodyPart: 'Back', sets: 4, reps: '5', equipment: 'Barbell' },
          { name: 'Pull-ups', bodyPart: 'Back', sets: 4, reps: '8', equipment: 'Bodyweight' },
          { name: 'Barbell Row', bodyPart: 'Back', sets: 3, reps: '8', equipment: 'Barbell' },
          { name: 'Barbell Curl', bodyPart: 'Arms', sets: 3, reps: '10', equipment: 'Barbell' },
          { name: 'Face Pulls', bodyPart: 'Back', sets: 3, reps: '15', equipment: 'Cable' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Legs A',
        focus: 'Quads, Hamstrings, Calves',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 5, reps: '5', equipment: 'Barbell' },
          { name: 'Romanian Deadlift', bodyPart: 'Legs', sets: 4, reps: '8', equipment: 'Barbell' },
          { name: 'Leg Press', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Machine' },
          { name: 'Leg Curl', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Machine' },
          { name: 'Calf Raises', bodyPart: 'Legs', sets: 4, reps: '15', equipment: 'Machine' },
        ],
      },
      {
        label: 'Day 4',
        title: 'Push B',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { name: 'Incline Bench Press', bodyPart: 'Chest', sets: 4, reps: '8', equipment: 'Barbell' },
          { name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders', sets: 4, reps: '10', equipment: 'Dumbbell' },
          { name: 'Cable Fly', bodyPart: 'Chest', sets: 3, reps: '12', equipment: 'Cable' },
          { name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 4, reps: '15', equipment: 'Dumbbell' },
          { name: 'Overhead Tricep Extension', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Dumbbell' },
        ],
      },
      {
        label: 'Day 5',
        title: 'Pull B',
        focus: 'Back, Biceps',
        exercises: [
          { name: 'Lat Pulldown', bodyPart: 'Back', sets: 4, reps: '10', equipment: 'Cable' },
          { name: 'Seated Cable Row', bodyPart: 'Back', sets: 4, reps: '10', equipment: 'Cable' },
          { name: 'Dumbbell Row', bodyPart: 'Back', sets: 3, reps: '10', equipment: 'Dumbbell', notes: 'Each side' },
          { name: 'Hammer Curl', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Dumbbell' },
          { name: 'Face Pulls', bodyPart: 'Back', sets: 3, reps: '15', equipment: 'Cable' },
        ],
      },
      {
        label: 'Day 6',
        title: 'Legs B',
        focus: 'Quads, Hamstrings, Glutes',
        exercises: [
          { name: 'Front Squat', bodyPart: 'Legs', sets: 4, reps: '8', equipment: 'Barbell', notes: 'Or goblet squat' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Dumbbell', notes: 'Each leg' },
          { name: 'Leg Press', bodyPart: 'Legs', sets: 4, reps: '15', equipment: 'Machine' },
          { name: 'Leg Curl', bodyPart: 'Legs', sets: 4, reps: '12', equipment: 'Machine' },
          { name: 'Calf Raises', bodyPart: 'Legs', sets: 5, reps: '20', equipment: 'Machine' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // STRENGTH
  // ─────────────────────────────────────────────────────────
  {
    id: 'five-by-five',
    title: '5x5 Strength Builder',
    category: 'strength',
    difficulty: 'Intermediate',
    durationWeeks: 12,
    workoutsPerWeek: 3,
    equipmentLevel: 'Full Gym',
    description:
      'One of the most effective strength programs ever written. Three compound movements per session, five sets of five reps. Add weight each week. Progress is built in — just show up and lift.',
    days: [
      {
        label: 'Day 1',
        title: 'Workout A',
        focus: 'Squat, Bench, Row',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 5, reps: '5', equipment: 'Barbell', notes: 'Add 5 lbs each session' },
          { name: 'Bench Press', bodyPart: 'Chest', sets: 5, reps: '5', equipment: 'Barbell', notes: 'Add 5 lbs each session' },
          { name: 'Barbell Row', bodyPart: 'Back', sets: 5, reps: '5', equipment: 'Barbell', notes: 'Add 5 lbs each session' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Workout B',
        focus: 'Squat, Press, Deadlift',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 5, reps: '5', equipment: 'Barbell', notes: 'Add 5 lbs each session' },
          { name: 'Overhead Press', bodyPart: 'Shoulders', sets: 5, reps: '5', equipment: 'Barbell', notes: 'Add 5 lbs each session' },
          { name: 'Deadlift', bodyPart: 'Back', sets: 1, reps: '5', equipment: 'Barbell', notes: 'Work up to top set of 5, add 10 lbs each session' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Workout A',
        focus: 'Squat, Bench, Row',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 5, reps: '5', equipment: 'Barbell', notes: 'Alternates with Workout B' },
          { name: 'Bench Press', bodyPart: 'Chest', sets: 5, reps: '5', equipment: 'Barbell' },
          { name: 'Barbell Row', bodyPart: 'Back', sets: 5, reps: '5', equipment: 'Barbell' },
        ],
      },
    ],
  },
  {
    id: 'powerlifting-foundation',
    title: 'Powerlifting Foundation',
    category: 'strength',
    difficulty: 'Advanced',
    durationWeeks: 16,
    workoutsPerWeek: 4,
    equipmentLevel: 'Full Gym',
    description:
      'A 16-week program built around the competitive lifts — squat, bench press, and deadlift. Each session focuses on one primary lift with accessory work to address weak points and build total-body strength.',
    days: [
      {
        label: 'Day 1',
        title: 'Squat Day',
        focus: 'Legs, Core',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 5, reps: '3', equipment: 'Barbell', notes: 'Heavy work sets at 80–90% 1RM' },
          { name: 'Pause Squat', bodyPart: 'Legs', sets: 3, reps: '3', equipment: 'Barbell', notes: '3-second pause at bottom' },
          { name: 'Romanian Deadlift', bodyPart: 'Legs', sets: 3, reps: '8', equipment: 'Barbell' },
          { name: 'Leg Press', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Machine' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '60 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Bench Day',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { name: 'Bench Press', bodyPart: 'Chest', sets: 5, reps: '3', equipment: 'Barbell', notes: 'Heavy work sets at 80–90% 1RM' },
          { name: 'Incline Bench Press', bodyPart: 'Chest', sets: 3, reps: '6', equipment: 'Barbell' },
          { name: 'Overhead Press', bodyPart: 'Shoulders', sets: 3, reps: '8', equipment: 'Barbell' },
          { name: 'Tricep Pushdown', bodyPart: 'Arms', sets: 4, reps: '12', equipment: 'Cable' },
          { name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 3, reps: '15', equipment: 'Dumbbell' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Deadlift Day',
        focus: 'Back, Legs',
        exercises: [
          { name: 'Deadlift', bodyPart: 'Back', sets: 5, reps: '3', equipment: 'Barbell', notes: 'Heavy work sets at 80–90% 1RM' },
          { name: 'T-Bar Row', bodyPart: 'Back', sets: 4, reps: '8', equipment: 'Barbell' },
          { name: 'Lat Pulldown', bodyPart: 'Back', sets: 3, reps: '10', equipment: 'Cable' },
          { name: 'Leg Curl', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Machine' },
          { name: 'Hyperextensions', bodyPart: 'Back', sets: 3, reps: '12', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 4',
        title: 'Press & Accessories',
        focus: 'Shoulders, Arms, Core',
        exercises: [
          { name: 'Overhead Press', bodyPart: 'Shoulders', sets: 5, reps: '5', equipment: 'Barbell' },
          { name: 'Bench Press', bodyPart: 'Chest', sets: 3, reps: '8', equipment: 'Barbell', notes: 'Lighter technique work' },
          { name: 'Barbell Curl', bodyPart: 'Arms', sets: 3, reps: '10', equipment: 'Barbell' },
          { name: 'Tricep Pushdown', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Cable' },
          { name: 'Face Pulls', bodyPart: 'Back', sets: 4, reps: '15', equipment: 'Cable', notes: 'Important for shoulder health' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // GENERAL FITNESS
  // ─────────────────────────────────────────────────────────
  {
    id: 'total-body-fitness',
    title: 'Total Body Fitness',
    category: 'general-fitness',
    difficulty: 'Beginner',
    durationWeeks: 8,
    workoutsPerWeek: 3,
    equipmentLevel: 'Minimal Equipment',
    description:
      'A well-rounded 8-week program for those who want to look and feel better without specializing in any one area. Builds cardiovascular fitness, functional strength, and flexibility with minimal equipment.',
    days: [
      {
        label: 'Day 1',
        title: 'Upper Body',
        focus: 'Chest, Back, Shoulders',
        exercises: [
          { name: 'Push-ups', bodyPart: 'Chest', sets: 3, reps: '10', equipment: 'Bodyweight' },
          { name: 'Dumbbell Row', bodyPart: 'Back', sets: 3, reps: '10', equipment: 'Dumbbell', notes: 'Each side' },
          { name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders', sets: 3, reps: '10', equipment: 'Dumbbell' },
          { name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 2, reps: '12', equipment: 'Dumbbell' },
          { name: 'Plank', bodyPart: 'Core', sets: 2, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Lower Body & Core',
        focus: 'Legs, Core',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Bodyweight' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Bodyweight', notes: 'Each leg' },
          { name: 'Romanian Deadlift', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Dumbbell' },
          { name: 'Calf Raises', bodyPart: 'Legs', sets: 3, reps: '15', equipment: 'Bodyweight' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Full Body',
        focus: 'Total Body',
        exercises: [
          { name: 'Dumbbell Press', bodyPart: 'Chest', sets: 3, reps: '10', equipment: 'Dumbbell' },
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Dumbbell' },
          { name: 'Dumbbell Row', bodyPart: 'Back', sets: 3, reps: '10', equipment: 'Dumbbell' },
          { name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders', sets: 2, reps: '10', equipment: 'Dumbbell' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 2, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
    ],
  },
  {
    id: 'athletic-foundation',
    title: 'Athletic Foundation',
    category: 'general-fitness',
    difficulty: 'Intermediate',
    durationWeeks: 10,
    workoutsPerWeek: 4,
    equipmentLevel: 'Full Gym',
    description:
      'An upper-lower split that develops balanced strength, athleticism, and conditioning. Each week alternates between power-focused and volume-focused sessions for well-rounded development.',
    days: [
      {
        label: 'Day 1',
        title: 'Upper Power',
        focus: 'Chest, Back, Shoulders',
        exercises: [
          { name: 'Bench Press', bodyPart: 'Chest', sets: 4, reps: '5', equipment: 'Barbell' },
          { name: 'Barbell Row', bodyPart: 'Back', sets: 4, reps: '5', equipment: 'Barbell' },
          { name: 'Overhead Press', bodyPart: 'Shoulders', sets: 3, reps: '6', equipment: 'Barbell' },
          { name: 'Pull-ups', bodyPart: 'Back', sets: 3, reps: '6', equipment: 'Bodyweight' },
          { name: 'Tricep Pushdown', bodyPart: 'Arms', sets: 3, reps: '10', equipment: 'Cable' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Lower Power',
        focus: 'Legs',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 4, reps: '5', equipment: 'Barbell' },
          { name: 'Deadlift', bodyPart: 'Back', sets: 3, reps: '5', equipment: 'Barbell' },
          { name: 'Leg Press', bodyPart: 'Legs', sets: 3, reps: '8', equipment: 'Machine' },
          { name: 'Leg Curl', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Machine' },
          { name: 'Calf Raises', bodyPart: 'Legs', sets: 3, reps: '15', equipment: 'Machine' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Upper Volume',
        focus: 'Chest, Back, Arms',
        exercises: [
          { name: 'Incline Dumbbell Press', bodyPart: 'Chest', sets: 4, reps: '10', equipment: 'Dumbbell' },
          { name: 'Seated Cable Row', bodyPart: 'Back', sets: 4, reps: '10', equipment: 'Cable' },
          { name: 'Lat Pulldown', bodyPart: 'Back', sets: 3, reps: '12', equipment: 'Cable' },
          { name: 'Barbell Curl', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Barbell' },
          { name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 3, reps: '15', equipment: 'Dumbbell' },
        ],
      },
      {
        label: 'Day 4',
        title: 'Lower Volume',
        focus: 'Legs, Core',
        exercises: [
          { name: 'Romanian Deadlift', bodyPart: 'Legs', sets: 4, reps: '10', equipment: 'Barbell' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Dumbbell', notes: 'Each leg' },
          { name: 'Leg Press', bodyPart: 'Legs', sets: 4, reps: '12', equipment: 'Machine' },
          { name: 'Leg Curl', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Machine' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '60 sec', equipment: 'Bodyweight' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // BEGINNER
  // ─────────────────────────────────────────────────────────
  {
    id: 'first-steps',
    title: 'First Steps',
    category: 'beginner',
    difficulty: 'Beginner',
    durationWeeks: 6,
    workoutsPerWeek: 3,
    equipmentLevel: 'No Equipment',
    description:
      'The safest starting point for anyone new to training. Six weeks of full-body workouts using only your bodyweight. Focus on learning movement patterns, building the habit, and avoiding injury.',
    days: [
      {
        label: 'Day 1',
        title: 'Full Body A',
        focus: 'Push, Core',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Bodyweight', notes: 'Go to comfortable depth' },
          { name: 'Push-ups', bodyPart: 'Chest', sets: 3, reps: '8', equipment: 'Bodyweight', notes: 'Knee variation is fine' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '20 sec', equipment: 'Bodyweight' },
          { name: 'Jumping Jacks', bodyPart: 'Core', sets: 2, reps: '30 sec', equipment: 'Bodyweight', notes: 'Warm-down cardio' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Full Body B',
        focus: 'Pull, Legs',
        exercises: [
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '8', equipment: 'Bodyweight', notes: 'Each leg, hold wall for balance' },
          { name: 'Chin-ups', bodyPart: 'Back', sets: 2, reps: '5', equipment: 'Bodyweight', notes: 'Use a band for assistance if needed' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 3, reps: '20 sec', equipment: 'Bodyweight' },
          { name: 'High Knees', bodyPart: 'Legs', sets: 2, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Full Body C',
        focus: 'Full Body',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Bodyweight' },
          { name: 'Push-ups', bodyPart: 'Chest', sets: 3, reps: '10', equipment: 'Bodyweight' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 2, reps: '8', equipment: 'Bodyweight' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
    ],
  },
  {
    id: 'gym-fundamentals',
    title: 'Gym Fundamentals',
    category: 'beginner',
    difficulty: 'Beginner',
    durationWeeks: 8,
    workoutsPerWeek: 3,
    equipmentLevel: 'Full Gym',
    description:
      'Your first structured gym program. Learn the fundamental barbell and dumbbell movements with light weight, proper form, and manageable volume. Two rotating full-body sessions build strength without overloading a beginner.',
    days: [
      {
        label: 'Day 1',
        title: 'Full Body A',
        focus: 'Squat, Push, Core',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '8', equipment: 'Barbell', notes: 'Light weight — focus on form' },
          { name: 'Bench Press', bodyPart: 'Chest', sets: 3, reps: '8', equipment: 'Barbell', notes: 'Start with just the bar' },
          { name: 'Lat Pulldown', bodyPart: 'Back', sets: 3, reps: '10', equipment: 'Cable' },
          { name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders', sets: 2, reps: '10', equipment: 'Dumbbell' },
          { name: 'Plank', bodyPart: 'Core', sets: 2, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Full Body B',
        focus: 'Hip Hinge, Pull, Core',
        exercises: [
          { name: 'Deadlift', bodyPart: 'Back', sets: 3, reps: '6', equipment: 'Barbell', notes: 'Learn the hip hinge pattern first' },
          { name: 'Dumbbell Row', bodyPart: 'Back', sets: 3, reps: '10', equipment: 'Dumbbell', notes: 'Each side' },
          { name: 'Dumbbell Press', bodyPart: 'Chest', sets: 3, reps: '10', equipment: 'Dumbbell' },
          { name: 'Leg Press', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Machine' },
          { name: 'Plank', bodyPart: 'Core', sets: 2, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Full Body A',
        focus: 'Squat, Push, Core',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Barbell', notes: 'Add small weight if Day 1 felt comfortable' },
          { name: 'Bench Press', bodyPart: 'Chest', sets: 3, reps: '10', equipment: 'Barbell' },
          { name: 'Lat Pulldown', bodyPart: 'Back', sets: 3, reps: '12', equipment: 'Cable' },
          { name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders', sets: 2, reps: '12', equipment: 'Dumbbell' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // HOME WORKOUTS
  // ─────────────────────────────────────────────────────────
  {
    id: 'bodyweight-builder',
    title: 'Bodyweight Builder',
    category: 'home',
    difficulty: 'Beginner',
    durationWeeks: 8,
    workoutsPerWeek: 4,
    equipmentLevel: 'No Equipment',
    description:
      'Build real strength at home with nothing but your bodyweight. Four sessions per week progressively increase in difficulty. By week 8, you will feel and move noticeably differently.',
    days: [
      {
        label: 'Day 1',
        title: 'Upper Push',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { name: 'Push-ups', bodyPart: 'Chest', sets: 4, reps: '12', equipment: 'Bodyweight' },
          { name: 'Pike Push-ups', bodyPart: 'Shoulders', sets: 3, reps: '10', equipment: 'Bodyweight', notes: 'Targets shoulders more than flat push-ups' },
          { name: 'Dips', bodyPart: 'Arms', sets: 3, reps: '10', equipment: 'Bodyweight', notes: 'Use a chair or couch edge' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '45 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Lower Body',
        focus: 'Quads, Hamstrings, Glutes',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 4, reps: '15', equipment: 'Bodyweight' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Bodyweight', notes: 'Each leg' },
          { name: 'Calf Raises', bodyPart: 'Legs', sets: 3, reps: '20', equipment: 'Bodyweight', notes: 'Single-leg if too easy' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Upper Pull & Core',
        focus: 'Back, Biceps, Core',
        exercises: [
          { name: 'Chin-ups', bodyPart: 'Back', sets: 4, reps: '6', equipment: 'Bodyweight', notes: 'Use a bar, door frame bar, or playground equipment' },
          { name: 'Plank', bodyPart: 'Core', sets: 4, reps: '45 sec', equipment: 'Bodyweight' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
          { name: 'High Knees', bodyPart: 'Legs', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 4',
        title: 'Full Body',
        focus: 'Total Body',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 3, reps: '15', equipment: 'Bodyweight' },
          { name: 'Push-ups', bodyPart: 'Chest', sets: 3, reps: '12', equipment: 'Bodyweight' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Bodyweight' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '45 sec', equipment: 'Bodyweight' },
          { name: 'Burpees', bodyPart: 'Core', sets: 2, reps: '8', equipment: 'Bodyweight' },
        ],
      },
    ],
  },
  {
    id: 'home-hiit',
    title: 'Home HIIT',
    category: 'home',
    difficulty: 'Intermediate',
    durationWeeks: 6,
    workoutsPerWeek: 4,
    equipmentLevel: 'No Equipment',
    description:
      'Short, intense sessions designed to burn calories, build conditioning, and develop functional strength — all from home. Sessions run 25–35 minutes. No equipment required, no excuses accepted.',
    days: [
      {
        label: 'Day 1',
        title: 'Upper HIIT',
        focus: 'Chest, Shoulders, Core',
        exercises: [
          { name: 'Push-ups', bodyPart: 'Chest', sets: 4, reps: '45 sec', equipment: 'Bodyweight', notes: '15 sec rest between sets' },
          { name: 'Pike Push-ups', bodyPart: 'Shoulders', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 4, reps: '40 sec', equipment: 'Bodyweight' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '45 sec', equipment: 'Bodyweight' },
          { name: 'Burpees', bodyPart: 'Core', sets: 3, reps: '10', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 2',
        title: 'Lower HIIT',
        focus: 'Legs, Glutes',
        exercises: [
          { name: 'Squat', bodyPart: 'Legs', sets: 4, reps: '45 sec', equipment: 'Bodyweight', notes: 'Explosive tempo' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '12', equipment: 'Bodyweight', notes: 'Each leg' },
          { name: 'High Knees', bodyPart: 'Legs', sets: 4, reps: '45 sec', equipment: 'Bodyweight' },
          { name: 'Calf Raises', bodyPart: 'Legs', sets: 3, reps: '20', equipment: 'Bodyweight' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 3, reps: '30 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 3',
        title: 'Strength Circuit',
        focus: 'Full Body',
        exercises: [
          { name: 'Push-ups', bodyPart: 'Chest', sets: 4, reps: '15', equipment: 'Bodyweight' },
          { name: 'Squat', bodyPart: 'Legs', sets: 4, reps: '20', equipment: 'Bodyweight' },
          { name: 'Dips', bodyPart: 'Arms', sets: 3, reps: '12', equipment: 'Bodyweight' },
          { name: 'Lunges', bodyPart: 'Legs', sets: 3, reps: '10', equipment: 'Bodyweight' },
          { name: 'Plank', bodyPart: 'Core', sets: 3, reps: '60 sec', equipment: 'Bodyweight' },
        ],
      },
      {
        label: 'Day 4',
        title: 'Core & Conditioning',
        focus: 'Core, Cardio',
        exercises: [
          { name: 'Jumping Jacks', bodyPart: 'Core', sets: 3, reps: '60 sec', equipment: 'Bodyweight' },
          { name: 'Mountain Climbers', bodyPart: 'Core', sets: 4, reps: '45 sec', equipment: 'Bodyweight' },
          { name: 'Plank', bodyPart: 'Core', sets: 4, reps: '45 sec', equipment: 'Bodyweight' },
          { name: 'High Knees', bodyPart: 'Legs', sets: 3, reps: '45 sec', equipment: 'Bodyweight' },
          { name: 'Burpees', bodyPart: 'Core', sets: 3, reps: '8', equipment: 'Bodyweight' },
        ],
      },
    ],
  },
];

export function getPlansByCategory(category: PlanCategory): WorkoutPlan[] {
  return WORKOUT_PLANS.filter((p) => p.category === category);
}

export function getPlanById(id: string): WorkoutPlan | undefined {
  return WORKOUT_PLANS.find((p) => p.id === id);
}
