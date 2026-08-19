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
    { name: 'Kettlebell Floor Press', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Pullover', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Pike Push-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Archer Push-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Diamond Push-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Pseudo Planche Push-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Muscle-ups', category: 'Strength', equipment: 'Bodyweight' },
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
    { name: 'Kettlebell Row', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Deadlift', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Renegade Row', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Good Morning', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Typewriter Pull-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Australian Pull-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Muscle-ups', category: 'Strength', equipment: 'Bodyweight' },
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
    { name: 'Kettlebell Press', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Halo', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Clean and Press', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Front Raise', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Handstand Push-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Wall Walk', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Pike Push-ups', category: 'Strength', equipment: 'Bodyweight' },
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
    { name: 'Kettlebell Curl', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Tricep Extension', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Hammer Curl', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Diamond Push-ups', category: 'Strength', equipment: 'Bodyweight' },
  ],
  Legs: [
    { name: 'Squat', category: 'Strength', equipment: 'Barbell' },
    { name: 'Pause Squat', category: 'Strength', equipment: 'Barbell' },
    { name: 'Front Squat', category: 'Strength', equipment: 'Barbell' },
    { name: 'Leg Press', category: 'Strength', equipment: 'Machine' },
    { name: 'Leg Extension', category: 'Strength', equipment: 'Machine' },
    { name: 'Leg Curl', category: 'Strength', equipment: 'Machine' },
    { name: 'Romanian Deadlift', category: 'Strength', equipment: 'Barbell' },
    { name: 'Lunges', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Bulgarian Split Squat', category: 'Strength', equipment: 'Dumbbell' },
    { name: 'Calf Raises', category: 'Strength', equipment: 'Machine' },
    { name: 'Leg Abduction', category: 'Strength', equipment: 'Machine' },
    { name: 'Kettlebell Goblet Squat', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Swing', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Romanian Deadlift', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Lunge', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Sumo Deadlift', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Single-Leg Deadlift', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Pistol Squat', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Jump Squat', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Box Jumps', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Broad Jumps', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Nordic Curl', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Step-ups', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Tuck Jump', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Lateral Bound', category: 'Strength', equipment: 'Bodyweight' },
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
    { name: 'Kettlebell Turkish Get-Up', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Windmill', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Russian Twist', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Farmer\'s Carry', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'Kettlebell Around the World', category: 'Strength', equipment: 'Kettlebell' },
    { name: 'L-Sit', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Dragon Flag', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Hollow Body Hold', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Superman Hold', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Bear Crawl', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Inchworm', category: 'Strength', equipment: 'Bodyweight' },
    { name: 'Burpee Pull-up', category: 'Cardio', equipment: 'Bodyweight' },
    { name: 'Wall Walk', category: 'Strength', equipment: 'Bodyweight' },
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
