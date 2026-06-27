import { ImageSourcePropType } from 'react-native';

export interface GuidanceFrame {
  label: 'Start' | 'Mid' | 'Finish';
  caption: string;
  imageSource?: ImageSourcePropType;
}

export interface ExerciseGuidance {
  frames: GuidanceFrame[];
  tips: string[];
}

export const EXERCISE_GUIDANCE: Record<string, ExerciseGuidance> = {
  'Bench Press': {
    frames: [
      {
        label: 'Start',
        imageSource: require('../../assets/guidance/bench-press-start.jpg'),
        caption: 'Lie flat, grip slightly wider than shoulders, bar over lower chest, shoulder blades retracted.',
      },
      {
        label: 'Mid',
        imageSource: require('../../assets/guidance/bench-press-mid.jpg'),
        caption: 'Lower the bar with control, elbows tracking at 45–75° from your torso.',
      },
      {
        label: 'Finish',
        imageSource: require('../../assets/guidance/bench-press-finish.jpg'),
        caption: 'Press to full extension without locking elbows hard, maintaining your natural arch.',
      },
    ],
    tips: [
      'Keep your feet flat on the floor throughout the lift.',
      'Squeeze your shoulder blades together and down before unracking.',
      'Breathe in on the descent, breathe out as you press.',
    ],
  },

  'Push-ups': {
    frames: [
      {
        label: 'Start',
        caption: 'Hands slightly wider than shoulders, body in a straight line from head to heels, core braced.',
      },
      {
        label: 'Mid',
        caption: 'Lower your chest toward the floor, elbows at roughly 45° from your body.',
      },
      {
        label: 'Finish',
        caption: 'Push back to the start position, keeping your hips level and body rigid throughout.',
      },
    ],
    tips: [
      "Don't let your hips sag or pike — your body should be a rigid plank.",
      'Keep your neck neutral; eyes look at the floor just in front of your hands.',
      'If full push-ups are too hard, drop to your knees but keep the same back line.',
    ],
  },

  'Deadlift': {
    frames: [
      {
        label: 'Start',
        imageSource: require('../../assets/guidance/deadlift-start.jpg'),
        caption: 'Feet hip-width apart, bar over mid-foot, grip just outside your legs, hips hinged back, back flat.',
      },
      {
        label: 'Mid',
        imageSource: require('../../assets/guidance/deadlift-mid.jpg'),
        caption: 'Drive through your heels, keeping the bar close to your body as it passes the knees.',
      },
      {
        label: 'Finish',
        imageSource: require('../../assets/guidance/deadlift-finish.jpg'),
        caption: 'Stand tall with hips fully extended — do not hyperextend your lower back at the top.',
      },
    ],
    tips: [
      'Keep your chest up and spine neutral from start to finish.',
      'The bar should stay close to your body — dragging up your shins is correct.',
      'Brace your core hard before every rep, as if preparing for a punch.',
      'Hinge at the hips on the way down — do not squat the bar back to the floor.',
    ],
  },

  'Dumbbell Row': {
    frames: [
      {
        label: 'Start',
        caption: 'One knee and hand on a bench, back flat and parallel to the floor, dumbbell hanging below your shoulder.',
      },
      {
        label: 'Mid',
        caption: 'Row the dumbbell toward your hip, keeping your elbow close to your body.',
      },
      {
        label: 'Finish',
        caption: 'Fully retract your shoulder blade at the top and hold briefly to feel the back engagement.',
      },
    ],
    tips: [
      'Avoid rotating your torso to help lift the weight — keep your hips square.',
      'Lead with your elbow, not your hand.',
      'Lower the dumbbell with control — the descent builds as much muscle as the pull.',
    ],
  },

  'Overhead Press': {
    frames: [
      {
        label: 'Start',
        caption: 'Bar resting on your front shoulders, grip slightly wider than shoulders, elbows just in front of the bar.',
      },
      {
        label: 'Mid',
        caption: 'Press straight up, moving your head slightly back to clear the bar path.',
      },
      {
        label: 'Finish',
        caption: 'Bar locked out overhead with ears between your arms, standing fully tall.',
      },
    ],
    tips: [
      'Brace your core and squeeze your glutes tightly — this protects your lower back.',
      "Don't flare your elbows wide; keep them at roughly 45° at the start position.",
      'Move your head back to let the bar pass, then bring it forward once the bar is overhead.',
    ],
  },

  'Dumbbell Shoulder Press': {
    frames: [
      {
        label: 'Start',
        caption: 'Seated or standing, dumbbells at shoulder height, palms facing forward, elbows at 90°.',
      },
      {
        label: 'Mid',
        caption: 'Press the dumbbells upward in a slight arc, bringing them toward each other overhead.',
      },
      {
        label: 'Finish',
        caption: 'Arms extended overhead, dumbbells nearly touching, without locking elbows hard.',
      },
    ],
    tips: [
      'Keep your core tight to avoid arching excessively through your lower back.',
      'Lower the dumbbells slowly — a controlled descent increases the training effect.',
      'Keep your wrists stacked directly over your elbows throughout the press.',
    ],
  },

  'Dumbbell Curl': {
    frames: [
      {
        label: 'Start',
        caption: 'Stand tall, dumbbells at your sides, palms facing forward, elbows pinned to your torso.',
      },
      {
        label: 'Mid',
        caption: 'Curl the dumbbells up by bending at the elbows only — your upper arms stay still.',
      },
      {
        label: 'Finish',
        caption: 'Dumbbells at shoulder level, squeeze your biceps hard at the top before lowering.',
      },
    ],
    tips: [
      'Do not swing your torso to help lift — that removes the work from your biceps.',
      'Keep your elbows pinned to your sides throughout the entire curl.',
      'Lower the weight slowly over 2–3 seconds — this doubles the muscle-building stimulus.',
    ],
  },

  'Squat': {
    frames: [
      {
        label: 'Start',
        imageSource: require('../../assets/guidance/squat-start.jpg'),
        caption: 'Bar on your upper traps, feet shoulder-width apart with toes slightly out, core braced.',
      },
      {
        label: 'Mid',
        imageSource: require('../../assets/guidance/squat-mid.jpg'),
        caption: 'Sit down and back, knees tracking over your toes, chest staying up throughout.',
      },
      {
        label: 'Finish',
        imageSource: require('../../assets/guidance/squat-finish.jpg'),
        caption: 'Drive through your heels to stand, fully extending your hips and knees at the top.',
      },
    ],
    tips: [
      'Keep your knees from caving inward — actively push them out in line with your toes.',
      'Aim for thighs parallel to the floor at the bottom, or deeper if mobility allows.',
      'Take a deep breath before descending and hold it until you pass the sticking point.',
    ],
  },

  'Lunges': {
    frames: [
      {
        label: 'Start',
        caption: 'Stand tall, feet together, dumbbells at your sides, core engaged and chest up.',
      },
      {
        label: 'Mid',
        caption: 'Step forward and lower your back knee toward the floor — front shin stays vertical.',
      },
      {
        label: 'Finish',
        caption: 'Push through your front heel to return to standing, then repeat on the other leg.',
      },
    ],
    tips: [
      'Keep your torso upright throughout — leaning forward shifts stress onto your knee.',
      'Your front knee should track over your second toe, not cave inward.',
      'Take a full enough stride so your front shin remains vertical at the bottom position.',
    ],
  },

  'Plank': {
    frames: [
      {
        label: 'Start',
        caption: 'Forearms on the floor, elbows directly under your shoulders, body in a straight line.',
      },
      {
        label: 'Mid',
        caption: 'Hold the position — squeeze your core, glutes, and quads simultaneously.',
      },
      {
        label: 'Finish',
        caption: 'Maintain the rigid line for the full duration, breathing steadily in and out.',
      },
    ],
    tips: [
      "Don't let your hips sag toward the floor or pike toward the ceiling.",
      'Keep your neck neutral — eyes look at the floor just in front of your hands.',
      'Squeeze your glutes hard — this automatically helps prevent hip sag.',
    ],
  },

  'Kettlebell Swing': {
    frames: [
      {
        label: 'Start',
        caption: 'Feet shoulder-width apart, KB on the floor slightly in front of you, hinge at the hips to grip the handle.',
      },
      {
        label: 'Mid',
        caption: 'Hike the KB back between your legs, then explosively snap your hips forward — not a squat, a hip drive.',
      },
      {
        label: 'Finish',
        caption: 'Hips fully extended, KB floats to chest height, arms relaxed — the hips power the swing, not the arms.',
      },
    ],
    tips: [
      'This is a hip hinge, not a squat — your knees should bend only slightly.',
      'The power comes from snapping your hips forward, not from pulling with your arms.',
      'Keep your shoulders packed down and back — do not shrug at the top.',
      'Brace your core hard at the top of every rep.',
    ],
  },

  'Kettlebell Goblet Squat': {
    frames: [
      {
        label: 'Start',
        caption: 'Hold the KB by the horns at chest height, feet shoulder-width apart, toes slightly out.',
      },
      {
        label: 'Mid',
        caption: 'Sit down into a squat, elbows tracking inside your knees, keeping the KB close to your chest.',
      },
      {
        label: 'Finish',
        caption: 'Drive through your heels to stand, fully extending your hips at the top of the movement.',
      },
    ],
    tips: [
      'Use your elbows to push your knees outward at the bottom — this opens your hips.',
      'Keep the KB close to your chest throughout — letting it drift forward pulls your torso over.',
      'Sit as deep as your mobility allows — the goblet hold helps you stay upright naturally.',
    ],
  },
};
