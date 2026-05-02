export const BODY_PARTS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
] as const;

export type BodyPart = typeof BODY_PARTS[number];

export const CATEGORIES = ['All', 'Strength', 'Cardio', 'Mobility'] as const;
export type Category = typeof CATEGORIES[number];

export interface Exercise {
  name: string;
  category: 'Strength' | 'Cardio' | 'Mobility';
  equipment: string;
}

export const EXERCISES: Record<BodyPart, Exercise[]> = {
  Chest: [
    { name: 'Bench Press', category: 'Strength', equipment: 'Barbell' },
    { name: 'Incline Bench Press', category: 'Strength', equipment: 'Barbell' },
    { name: 'Decline Bench Press', category: 'Strength', equipment: 'Barbell' },
    { name: 'Dumbbell Press', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Incline Dumbbell Press', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Chest Fly', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Cable Fly', category: 'Strength', equipment: 'Cable' },
    { name: 'Push-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Dips', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Pec Deck', category: 'Strength', equipment: 'Machine' },
  ],
  Back: [
    { name: 'Deadlift', category: 'Strength', equipment: 'Barbell' },
    { name: 'Pull-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Chin-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Lat Pulldown', category: 'Strength', equipment: 'Cable' },
    { name: 'Barbell Row', category: 'Strength', equipment: 'Barbell' },
    { name: 'Dumbbell Row', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'T-Bar Row', category: 'Strength', equipment: 'Barbell' },
    { name: 'Seated Cable Row', category: 'Strength', equipment: 'Cable' },
    { name: 'Face Pulls', category: 'Strength', equipment: 'Cable' },
    { name: 'Hyperextensions', category: 'Strength', equipment: 'Bodyweight' },
  ],
  Shoulders: [
    { name: 'Overhead Press', category: 'Strength', equipment: 'Barbell' },
    { name: 'Military Press', category: 'Strength', equipment: 'Barbell' },
    { name: 'Dumbbell Shoulder Press', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Arnold Press', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Lateral Raises', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Front Raises', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Rear Delt Fly', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Upright Row', category: 'Strength', equipment: 'Barbell' },
    { name: 'Shrugs', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Cable Lateral Raises', category: 'Strength', equipment: 'Cable' },
  ],
  Arms: [
    { name: 'Barbell Curl', category: 'Strength', equipment: 'Barbell' },
    { name: 'Dumbbell Curl', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Hammer Curl', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Preacher Curl', category: 'Strength', equipment: 'Machine' },
    { name: 'Cable Curl', category: 'Strength', equipment: 'Cable' },
    { name: 'Tricep Dips', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Close-grip Bench Press', category: 'Strength', equipment: 'Barbell' },
    { name: 'Tricep Pushdown', category: 'Strength', equipment: 'Cable' },
    { name: 'Overhead Tricep Extension', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Skull Crushers', category: 'Strength', equipment: 'Barbell' },
  ],
  Legs: [
    { name: 'Squat', category: 'Strength', equipment: 'Barbell' },
    { name: 'Front Squat', category: 'Strength', equipment: 'Barbell' },
    { name: 'Leg Press', category: 'Strength', equipment: 'Machine' },
    { name: 'Leg Extension', category: 'Strength', equipment: 'Machine' },
    { name: 'Leg Curl', category: 'Strength', equipment: 'Machine' },
    { name: 'Romanian Deadlift', category: 'Strength', equipment: 'Barbell' },
    { name: 'Lunges', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Bulgarian Split Squat', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Calf Raises', category: 'Strength', equipment: 'Machine' },
    { name: 'Leg Abduction', category: 'Strength', equipment: 'Machine' },
  ],
  Core: [
    { name: 'Plank', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Side Plank', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Crunches', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Bicycle Crunches', category: 'Cardio', equipment: 'Bodyweight' },
    { name: 'Russian Twists', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Leg Raises', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Hanging Leg Raises', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Ab Wheel', category: 'Strength', equipment: 'Equipment' },
    { name: 'Cable Crunches', category: 'Strength', equipment: 'Cable' },
    { name: 'Mountain Climbers', category: 'Cardio', equipment: 'Bodyweight' },
  ],
};

export interface ExerciseSelection {
  name: string;
  bodyPart: BodyPart;
  category: 'Strength' | 'Cardio' | 'Mobility';
  equipment: string;
  sets: number;
  reps: number;
  weight: string;
  selected: boolean;
}
