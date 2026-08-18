// ─────────────────────────────────────────────────────────────────────────────
// Exercise coaching data
//
// Keys are stable slugs independent of display names so content can be updated
// without changing how it is looked up. COACHING_NAME_TO_KEY maps the exact
// exercise name used in exercises.ts → stable key.
// ─────────────────────────────────────────────────────────────────────────────

export type ExerciseVariation = {
  name: string;
  purpose: string;
  formChange: string;
  difficulty: 'easier' | 'similar' | 'harder';
};

export type ExerciseCoaching = {
  exerciseKey: string;
  displayName: string;
  summary: string;
  setup: string[];
  execution: string[];
  breathing: string[];
  cues: string[];
  commonMistakes: string[];
  variations: ExerciseVariation[];
  safetyNotes: string[];
  images?: {
    start?: number | string;
    midpoint?: number | string;
    finish?: number | string;
  };
  contentVersion: number;
  reviewedAt: string;
};

/**
 * Maps the exact exercise name stored in exercises.ts to a stable coaching key.
 * Add entries here whenever a new exercise gets coaching content.
 */
export const COACHING_NAME_TO_KEY: Record<string, string> = {
  'Bench Press': 'bench-press',
  'Squat': 'squat',
  'Deadlift': 'deadlift',
  'Barbell Row': 'barbell-row',
  'Push-ups': 'push-ups',
};

export const EXERCISE_COACHING: Record<string, ExerciseCoaching> = {

  // ── Bench Press ─────────────────────────────────────────────────────────────
  'bench-press': {
    exerciseKey: 'bench-press',
    displayName: 'Bench Press',
    summary:
      'A horizontal pressing movement that trains the chest, front shoulders, and triceps. ' +
      'Technique, bar path, and body position all influence where you feel it most.',
    setup: [
      'Lie on the bench so your eyes are roughly under the bar.',
      'A useful starting position has your feet flat on the floor (or firmly on the bench if that suits your build).',
      'Retract and depress your shoulder blades — think "pinch and pull down" — before gripping the bar.',
      'Grip the bar slightly wider than shoulder width, wrists in line with your forearms.',
      'Maintain a natural arch in your lower back; exaggerated arching is optional and depends on your goals.',
      'Unrack by pressing straight up, then shift the bar over your lower chest.',
    ],
    execution: [
      'Lower the bar with control, aiming for your lower chest or sternum.',
      'Elbows tend to travel at 45–75° from your torso — experiment to find what feels strong and comfortable in your shoulder.',
      'Touch or graze the chest lightly, then press back up in a slight arc toward the rack.',
      'Choose the range of motion you can control comfortably — a small touch-and-press is fine if full depth causes discomfort.',
      'Press through the whole set without losing shoulder-blade position.',
    ],
    breathing: [
      'Take a breath in and brace your core before lowering the bar.',
      'Hold the brace through the descent and the press.',
      'Exhale at the top or once past the sticking point.',
      'For lighter sets, breathing once per rep is fine; for heavy singles, some lifters hold for the full rep.',
    ],
    cues: [
      '"Bend the bar" — imagine pulling the ends apart; this tends to engage the lats and stabilise the shoulder.',
      '"Drive your feet into the floor" — creates tension through the whole body.',
      '"Lead with the chest, not the bar" — keep your chest up as the bar descends.',
      '"Press the ceiling away" — focuses effort on pushing rather than thinking about the bar path.',
    ],
    commonMistakes: [
      'Letting the wrists bend back — keep them stacked over the forearms to reduce wrist strain.',
      'Flaring the elbows wide — tends to load the front shoulder more and can cause discomfort over time.',
      'Bouncing the bar off the chest — reduces control and shifts load away from the target muscles.',
      'Unracking with a horizontal path — always press straight up before shifting the bar into position.',
      'Losing foot contact or leg drive partway through the set.',
    ],
    variations: [
      {
        name: 'Close-grip Bench Press',
        purpose: 'Places relatively more emphasis on the triceps; useful for building lockout strength.',
        formChange: 'Bring hands to roughly shoulder width or slightly inside. Expect elbows to track closer to your torso.',
        difficulty: 'similar',
      },
      {
        name: 'Incline Bench Press',
        purpose: 'Shifts loading toward the upper chest and front shoulder.',
        formChange: 'Set bench to 30–45°. Bar path may shift slightly higher toward the upper chest. Shoulder-blade setup still applies.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Bench Press',
        purpose: 'Allows each arm to move independently; useful for addressing left-right differences.',
        formChange: 'Press the dumbbells together at the top if comfortable. Neutral or semi-supinated grip is an option.',
        difficulty: 'similar',
      },
      {
        name: 'Elevated Push-up',
        purpose: 'A bodyweight pressing option that approximates the bench angle without equipment.',
        formChange: 'Hands on a bench or box, feet on the floor. Body forms a straight line. Lower chest to the surface.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Use a spotter or safety catches when working near your maximum on a barbell.',
      'Sharp pain in the front of the shoulder or wrist during or after pressing is a signal to reduce load, adjust grip width, or seek guidance.',
      'Adjust the setup to your mobility, equipment, and goal — no single bar path or grip width is universally correct.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Squat ───────────────────────────────────────────────────────────────────
  'squat': {
    exerciseKey: 'squat',
    displayName: 'Squat',
    summary:
      'A lower-body compound movement that trains the quads, glutes, and hips. ' +
      'Stance width, depth, and bar position can all be adjusted to match your build and mobility.',
    setup: [
      'Set the bar at roughly upper-chest height in the rack. Step under it so the bar rests on your upper traps or rear delts — experiment to find a comfortable shelf.',
      'A useful starting position has feet roughly shoulder-width apart, toes turned out 15–30°.',
      'Take a breath in, brace your core as if preparing for mild impact, then unrack by pushing your hips forward.',
      'Step back with the minimum number of steps needed to clear the rack.',
      'Find your balance point — weight should feel distributed across the whole foot, neither heels nor toes dominant.',
    ],
    execution: [
      'Initiate the descent by pushing your knees out in the direction of your toes and sitting your hips back and down.',
      'Keep your torso angle consistent with your build — some forward lean is normal and not inherently wrong.',
      'Descend to the depth you can control comfortably. Hitting parallel or below is a useful goal; stop where your lower back rounds more than you intend.',
      'Drive back up by pushing the floor away. Hips and shoulders should rise at the same rate.',
      'Lock out at the top without hyperextending the knees or lower back.',
    ],
    breathing: [
      'Take a full breath in before each rep and brace your core firmly.',
      'Hold the brace through the descent and the majority of the ascent.',
      'Exhale at the top or once past the sticking point.',
      'For multiple reps, rebrace at the top between reps rather than breathing throughout the movement.',
    ],
    cues: [
      '"Spread the floor" — imagine pushing your feet apart; tends to activate the hips and stabilise the knee.',
      '"Chest up" — helps maintain torso position throughout the descent.',
      '"Sit into it" — encourages hip flexion rather than only knee flexion.',
      '"Drive through the whole foot" — keeps balance centered during the ascent.',
    ],
    commonMistakes: [
      'Knees caving inward (valgus collapse) — focus on pushing knees out in line with toes.',
      'Rising onto the toes — usually indicates tight ankles or too much forward lean; elevating heels slightly can help.',
      'Shooting the hips up faster than the chest at the bottom — a sign the movement is becoming a good morning.',
      'Excessive forward lean — may indicate bar position, ankle mobility, or stance width needs adjustment.',
      'Rounding the lower back at depth — reduce depth until mobility improves.',
    ],
    variations: [
      {
        name: 'Box Squat',
        purpose: 'Teaches controlled depth and a pause at the bottom; useful for learning pacing.',
        formChange: 'Set a box at or slightly below parallel. Sit back onto the box under control, pause briefly, then drive up.',
        difficulty: 'easier',
      },
      {
        name: 'Goblet Squat',
        purpose: 'Counterbalance from holding a weight in front tends to make an upright torso easier to achieve.',
        formChange: 'Hold a dumbbell or kettlebell at chest height. Elbows track inside the knees at the bottom.',
        difficulty: 'easier',
      },
      {
        name: 'Front Squat',
        purpose: 'Places relatively more demand on the quads and upper back; requires greater thoracic and wrist mobility.',
        formChange: 'Bar rests on the front delts with elbows high. Torso stays more upright than a back squat.',
        difficulty: 'harder',
      },
      {
        name: 'Split Squat',
        purpose: 'Trains each leg with some independence; useful for addressing left-right differences.',
        formChange: 'Staggered stance, rear foot on floor or elevated. Lower the rear knee toward the floor, keep front shin roughly vertical.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Use safety bars or a power rack when squatting alone with heavy loads.',
      'Pain in the knee, hip, or lower back is a signal to reduce load, adjust stance, or seek guidance — it is not something to push through.',
      'Adjust the setup to your mobility, equipment, and goal — there is a wide range of effective squat styles.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Deadlift ─────────────────────────────────────────────────────────────────
  'deadlift': {
    exerciseKey: 'deadlift',
    displayName: 'Deadlift',
    summary:
      'A hip-hinge movement that trains the posterior chain — glutes, hamstrings, and spinal erectors — ' +
      'along with a full-body demand for bracing and grip. The load starts and ends on the floor.',
    setup: [
      'Stand with the bar over your mid-foot, roughly 2–3 cm from your shins.',
      'A useful starting position has feet hip-width apart, toes pointed forward or slightly out.',
      'Push your hips back and hinge until you can grip the bar — shoulder-width or just outside, overhand or mixed grip.',
      'Before lifting, lower your hips until your shins make light contact with the bar.',
      'Create tension before the pull: take a breath in, brace your core firmly, and think of "pulling the slack out of the bar" before the load actually moves.',
      'Shoulder blades should be roughly over the bar at the start.',
    ],
    execution: [
      'Begin the pull by pushing the floor away — imagine a leg press — while the hips and shoulders rise together.',
      'Keep the bar close to your body throughout; it should graze or lightly contact your shins and thighs on the way up.',
      'As the bar passes the knee, drive your hips forward to complete the lockout.',
      'At the top, stand tall with hips and knees extended — avoid hyperextending the lower back.',
      'Lower under control by hinging the hips back first, then bending the knees once the bar passes them.',
      'Reset your brace on each rep for training sets; experienced lifters sometimes use touch-and-go on lighter sets.',
    ],
    breathing: [
      'Take a full breath into your belly before each rep and brace hard.',
      'Hold the brace through the full rep — do not exhale mid-pull.',
      'Exhale and reset at the top or after setting the bar down.',
    ],
    cues: [
      '"Push the floor away" — frames the start as a leg drive movement, not a back pull.',
      '"Bar stays close" — any gap between bar and body increases the lever arm on the lower back.',
      '"Chest up, lats tight" — helps maintain a neutral spine and stops the bar from drifting forward.',
      '"Squeeze oranges in your armpits" — activates the lats and stabilises the upper back.',
    ],
    commonMistakes: [
      'Jerking the bar off the floor — creates a sudden load spike; take the slack out first and apply force progressively.',
      'Bar drifting away from the body — substantially increases lower-back demand.',
      'Hips rising faster than the chest — the movement can become a stiff-leg deadlift unexpectedly.',
      'Rounding the upper back — often a sign of fatigue, excessive load, or poor lat engagement.',
      'Hyperextending at the top — lockout means hips forward, not lower back arched hard.',
    ],
    variations: [
      {
        name: 'Romanian Deadlift',
        purpose: 'Places relatively more emphasis on the hamstrings and glutes; bar does not return to the floor each rep.',
        formChange: 'Start standing. Hinge the hips back while keeping a slight knee bend. Lower until you feel hamstring tension, then drive hips forward.',
        difficulty: 'similar',
      },
      {
        name: 'Trap-bar Deadlift',
        purpose: 'The neutral handles allow a more upright torso and can reduce lower-back demand; useful when learning hip hinge mechanics.',
        formChange: 'Stand inside the trap bar, grip the handles, and pull in the same pattern. Torso angle tends to be more upright.',
        difficulty: 'easier',
      },
      {
        name: 'Block Pull',
        purpose: 'Shortens the range of motion; useful for practicing the upper portion of the lift or training with heavier loads.',
        formChange: 'Place the bar on blocks or pins so it starts at knee height or above. Setup and execution otherwise identical.',
        difficulty: 'similar',
      },
      {
        name: 'Kettlebell Deadlift',
        purpose: 'A low-barrier option for learning the hip hinge pattern with less load and simpler setup.',
        formChange: 'Kettlebell between your feet. Hinge, grip the handle, and pull while keeping the bell close. Same hip drive to lockout.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Wear a belt if you find it helpful; a belt works with bracing, not as a substitute for it.',
      'Sharp or acute lower-back pain during or after deadlifts is a signal to stop, reduce load, or seek professional assessment.',
      'Adjust grip, stance, and range of motion to your build and mobility — effective technique varies between individuals.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Barbell Row ──────────────────────────────────────────────────────────────
  'barbell-row': {
    exerciseKey: 'barbell-row',
    displayName: 'Barbell Row',
    summary:
      'A horizontal pulling movement that trains the upper and mid back, rear shoulders, and biceps. ' +
      'The torso angle and pull direction influence which muscles are emphasised.',
    setup: [
      'Stand with the bar over your mid-foot, hip-width stance.',
      'Hinge forward until your torso is roughly parallel to the floor, or between 45° and parallel.',
      'Grip the bar just outside your knees — overhand for more upper-back and rear-delt involvement; underhand for a different elbow path and more bicep contribution.',
      'Before pulling, take a breath in and brace your core. This is your base position for every rep.',
      'Keep a neutral spine — avoid rounding the lower back under load.',
    ],
    execution: [
      'Pull the bar toward your lower chest or upper abdomen, depending on your torso angle and goal.',
      'Lead with your elbows — think of driving them back and up rather than curling the bar.',
      'Squeeze the shoulder blades together at the top of the pull.',
      'Lower the bar under control, maintaining torso position.',
      'Avoid jerking or using excessive momentum — some torso movement is natural under heavy loads, but the set should remain controlled.',
      'Reset your brace at the top if needed before the next rep.',
    ],
    breathing: [
      'Take a breath in and brace before each rep or small cluster of reps.',
      'Exhale at the top of the pull or between reps while keeping the torso steady.',
      'On heavy sets, hold the brace for the full rep and exhale at the top.',
    ],
    cues: [
      '"Elbows to the ceiling" — encourages the pull to travel in the right direction.',
      '"Squeeze a pencil between your shoulder blades" — promotes scapular retraction at the top.',
      '"Chest proud" — helps maintain a neutral upper back and prevents rounding.',
      '"Bar stays close" — like the deadlift, keeping the bar near your body reduces lever-arm demand.',
    ],
    commonMistakes: [
      'Rounding the lower back under load — reduce weight or improve hip-hinge bracing before adding load.',
      'Using too much momentum — body English is sometimes intentional for overload, but unintended swinging tends to shift load away from the back.',
      'Pulling too high toward the neck — shifts demand toward the traps and away from the mid-back.',
      'Losing torso angle between reps — the torso should stay roughly consistent through the set.',
      'Gripping too wide — tends to limit range of motion and elbow travel.',
    ],
    variations: [
      {
        name: 'Chest-supported Row',
        purpose: 'The bench removes the need to maintain torso position; useful for isolating the pulling movement.',
        formChange: 'Set an incline bench at 30–45°. Lie face-down and row from this supported position.',
        difficulty: 'easier',
      },
      {
        name: 'One-arm Dumbbell Row',
        purpose: 'Trains each side independently; allows a greater range of motion and longer pull.',
        formChange: 'Brace one hand and knee on a bench. Row the dumbbell toward your hip with the opposite arm.',
        difficulty: 'similar',
      },
      {
        name: 'Pendlay Row',
        purpose: 'Each rep starts from a dead stop on the floor; reduces momentum and tends to train more explosive pulling strength.',
        formChange: 'Bar returns fully to the floor between reps. Torso is roughly parallel to the floor throughout.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Row',
        purpose: 'Constant tension through the full range of motion; useful for higher-rep work and less spinal loading.',
        formChange: 'Seated at a cable station. Pull the handle toward your lower chest or abdomen. Maintain upright or slightly hinged torso.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Heavy barbell rows place real demand on the lower back — brace before every rep, and reduce load if your back rounds significantly.',
      'A rounded upper back is common and less concerning than a rounded lower back under heavy load, but be aware of both.',
      'Adjust the setup to your mobility, equipment, and goal.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Push-ups ─────────────────────────────────────────────────────────────────
  'push-ups': {
    exerciseKey: 'push-ups',
    displayName: 'Push-ups',
    summary:
      'A bodyweight pressing movement that trains the chest, front shoulders, and triceps. ' +
      'Hand position, body alignment, and range of motion can all be adjusted to suit your current level.',
    setup: [
      'Place your hands slightly wider than shoulder width — experiment to find what feels stable and comfortable in the shoulder.',
      'Set your fingers pointing forward or angled slightly outward.',
      'From the top position, your body should form a straight line from head to heels — engage your core and glutes to maintain this alignment.',
      'A useful starting cue is to think "make your body a plank before you move."',
    ],
    execution: [
      'Lower your chest toward the floor with control, elbows tracking at roughly 45° from your torso.',
      'Lower until your chest is close to or lightly touches the floor, or to the depth you can control without losing body alignment.',
      'Press back up smoothly to the start position.',
      'Avoid letting the hips sag or rise — both indicate the core has disengaged.',
      'Choose the range of motion you can control comfortably; partial reps while maintaining alignment are preferable to full reps with a sagging lower back.',
    ],
    breathing: [
      'Breathe in as you lower.',
      'Breathe out as you press back up.',
      'On high-rep sets, keep breathing rhythmically rather than holding your breath.',
    ],
    cues: [
      '"Push the floor away" — focuses on the pressing action rather than just lowering and rising.',
      '"Elbows back, not out" — helps keep elbow at a safer angle and engages the triceps.',
      '"Rigid plank" — keeps your mind on whole-body tension.',
      '"Chin forward, not down" — helps maintain a neutral neck position.',
    ],
    commonMistakes: [
      'Hips sagging — a sign the core is not engaged; strengthen the plank hold first.',
      'Hips piking upward — reduces the load on the chest and disrupts alignment.',
      'Flaring the elbows wide — tends to load the front shoulder more and can cause discomfort.',
      'Not reaching full extension at the top — reduces the range of motion unnecessarily.',
      'Looking up or down sharply — aim to keep the neck in line with the spine.',
    ],
    variations: [
      {
        name: 'Wall Push-up',
        purpose: 'Reduces load substantially by changing the angle; a useful starting point for building confidence and pattern.',
        formChange: 'Stand facing a wall and place hands on it at chest height. Lower toward the wall and press back.',
        difficulty: 'easier',
      },
      {
        name: 'Incline Push-up',
        purpose: 'An intermediate reduction in load; hands are elevated on a bench, step, or table.',
        formChange: 'Hands on a surface higher than feet. The higher the surface, the less load. Body alignment still applies.',
        difficulty: 'easier',
      },
      {
        name: 'Knee Push-up',
        purpose: 'Shortens the lever arm by using knees as the pivot; a common stepping stone toward full push-ups.',
        formChange: 'Knees on the floor instead of feet. Maintain a straight line from knees to head.',
        difficulty: 'easier',
      },
      {
        name: 'Close-grip Push-up',
        purpose: 'Places relatively more emphasis on the triceps and inner chest.',
        formChange: 'Hands under the chest, closer than shoulder width. Elbows track close to the sides.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Wrist discomfort during push-ups is common — try turning hands slightly outward, using push-up handles, or performing on fists.',
      'Shoulder pain at the front of the joint is a signal to check hand width, elbow angle, or to try an easier variation.',
      'Adjust hand position, range of motion, and elevation to your comfort and current ability.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },
};
