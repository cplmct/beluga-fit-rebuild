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
  // ── Chest batch ──────────────────────────────────────────────────────────────
  'Incline Bench Press': 'incline-bench-press',
  'Decline Bench Press': 'decline-bench-press',
  'Dumbbell Press': 'dumbbell-press',
  'Incline Dumbbell Press': 'incline-dumbbell-press',
  'Chest Fly': 'chest-fly',
  'Cable Fly': 'cable-fly',
  'Dips': 'dips',
  'Pec Deck': 'pec-deck',
  'Kettlebell Floor Press': 'kettlebell-floor-press',
  'Kettlebell Pullover': 'kettlebell-pullover',
  'Pike Push-ups': 'pike-push-ups',       // shared: Chest + Shoulders
  'Archer Push-ups': 'archer-push-ups',
  'Diamond Push-ups': 'diamond-push-ups', // shared: Chest + Arms
  'Pseudo Planche Push-ups': 'pseudo-planche-push-ups',
  'Muscle-ups': 'muscle-ups',             // shared: Chest + Back
  // ── Back batch ───────────────────────────────────────────────────────────────
  'Pull-ups': 'pull-ups',
  'Chin-ups': 'chin-ups',
  'Lat Pulldown': 'lat-pulldown',
  'Dumbbell Row': 'dumbbell-row',
  'T-Bar Row': 't-bar-row',
  'Seated Cable Row': 'seated-cable-row',
  'Face Pulls': 'face-pulls',
  'Hyperextensions': 'hyperextensions',
  'Kettlebell Row': 'kettlebell-row',
  'Kettlebell Deadlift': 'kettlebell-deadlift',
  'Kettlebell Renegade Row': 'kettlebell-renegade-row',
  'Kettlebell Good Morning': 'kettlebell-good-morning',
  'Typewriter Pull-ups': 'typewriter-pull-ups',
  'Australian Pull-ups': 'australian-pull-ups',
  // ── Shoulders batch ──────────────────────────────────────────────────────────
  'Overhead Press': 'overhead-press',
  'Military Press': 'military-press',
  'Dumbbell Shoulder Press': 'dumbbell-shoulder-press',
  'Arnold Press': 'arnold-press',
  'Lateral Raises': 'lateral-raises',
  'Front Raises': 'front-raises',
  'Rear Delt Fly': 'rear-delt-fly',
  'Upright Row': 'upright-row',
  'Shrugs': 'shrugs',
  'Cable Lateral Raises': 'cable-lateral-raises',
  'Kettlebell Press': 'kettlebell-press',
  'Kettlebell Halo': 'kettlebell-halo',
  'Kettlebell Clean and Press': 'kettlebell-clean-and-press',
  'Kettlebell Front Raise': 'kettlebell-front-raise',
  'Handstand Push-ups': 'handstand-push-ups',
  'Wall Walk': 'wall-walk',               // shared: Shoulders + Core (added once)
  // ── Arms batch ───────────────────────────────────────────────────────────────
  'Barbell Curl': 'barbell-curl',
  'Dumbbell Curl': 'dumbbell-curl',
  'Hammer Curl': 'hammer-curl',
  'Preacher Curl': 'preacher-curl',
  'Cable Curl': 'cable-curl',
  'Tricep Dips': 'tricep-dips',
  'Close-grip Bench Press': 'close-grip-bench-press',
  'Tricep Pushdown': 'tricep-pushdown',
  'Overhead Tricep Extension': 'overhead-tricep-extension',
  'Skull Crushers': 'skull-crushers',
  'Kettlebell Curl': 'kettlebell-curl',
  'Kettlebell Tricep Extension': 'kettlebell-tricep-extension',
  'Kettlebell Hammer Curl': 'kettlebell-hammer-curl',
  // ── Legs batch ───────────────────────────────────────────────────────────
  'Front Squat': 'front-squat',
  'Leg Press': 'leg-press',
  'Leg Extension': 'leg-extension',
  'Leg Curl': 'leg-curl',
  'Romanian Deadlift': 'romanian-deadlift',
  'Lunges': 'lunges',
  'Bulgarian Split Squat': 'bulgarian-split-squat',
  'Calf Raises': 'calf-raises',
  'Leg Abduction': 'leg-abduction',
  'Kettlebell Goblet Squat': 'kettlebell-goblet-squat',
  'Kettlebell Swing': 'kettlebell-swing',
  'Kettlebell Romanian Deadlift': 'kettlebell-romanian-deadlift',
  'Kettlebell Lunge': 'kettlebell-lunge',
  'Kettlebell Sumo Deadlift': 'kettlebell-sumo-deadlift',
  'Kettlebell Single-Leg Deadlift': 'kettlebell-single-leg-deadlift',
  'Pistol Squat': 'pistol-squat',
  'Jump Squat': 'jump-squat',
  'Box Jumps': 'box-jumps',
  'Broad Jumps': 'broad-jumps',
  'Nordic Curl': 'nordic-curl',
  'Step-ups': 'step-ups',
  'Tuck Jump': 'tuck-jump',
  'Lateral Bound': 'lateral-bound',
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

  // ════════════════════════════════════════════════════════════════════════════
  // CHEST
  // ════════════════════════════════════════════════════════════════════════════

  // ── Incline Bench Press ──────────────────────────────────────────────────────
  'incline-bench-press': {
    exerciseKey: 'incline-bench-press',
    displayName: 'Incline Bench Press',
    summary:
      'A barbell pressing movement performed on an inclined bench that places relatively more ' +
      'emphasis on the upper chest and front shoulders compared to a flat bench.',
    setup: [
      'Set the bench to 30–45°. Steeper angles shift more demand toward the front shoulder; 30–45° is a common starting range.',
      'Position yourself so your eyes are roughly under the bar when lying back.',
      'Retract and depress your shoulder blades before gripping — the same setup as a flat bench press.',
      'Grip slightly wider than shoulder width, wrists stacked over your forearms.',
      'Keep your feet flat on the floor for a stable base throughout the set.',
      'Unrack by pressing straight up, then shift the bar over your upper chest before beginning.',
    ],
    execution: [
      'Lower the bar with control toward your upper chest, roughly at the level of your collarbone or just below.',
      'Elbows track at roughly 45–75° from your torso — experiment within that range for shoulder comfort.',
      'Touch or lightly graze your upper chest, then press back up in a slight arc.',
      'Choose a range of motion you can control comfortably; a reduced touch point is fine if full depth causes shoulder discomfort.',
      'Maintain shoulder-blade position throughout the set — avoid letting the shoulders roll forward at the top.',
    ],
    breathing: [
      'Take a breath in and brace before lowering the bar.',
      'Hold the brace through the descent and the press.',
      'Exhale at the top or once past the sticking point.',
      'For lighter work, breathing once per rep is fine; for heavier efforts, hold the brace for the full rep.',
    ],
    cues: [
      '"Pinch and pull down" — retract shoulder blades before the first rep and keep them there.',
      '"Press the ceiling away at an angle" — think about the direction the bar travels, not just up.',
      '"Drive the feet into the floor" — builds full-body tension even though it is an upper-body lift.',
      '"Control the descent" — a slow, deliberate lowering phase improves muscle engagement and safety.',
    ],
    commonMistakes: [
      'Setting the bench too steep — angles above 45° shift most demand to the front shoulder and reduce chest involvement.',
      'Letting the bar drift too far down the chest — the bar should land near the upper chest, not the sternum.',
      'Flaring the elbows excessively — tends to load the front shoulder and can contribute to discomfort over time.',
      'Losing shoulder-blade position at the top — rolling the shoulders forward at lockout reduces stability.',
      'Bouncing the bar off the chest — reduces control; use a light touch or brief pause instead.',
    ],
    variations: [
      {
        name: 'Incline Dumbbell Press',
        purpose: 'Allows each arm to move independently; useful for addressing left-right strength differences.',
        formChange: 'Hold a dumbbell in each hand. Press from shoulder height to full extension at the same incline angle.',
        difficulty: 'similar',
      },
      {
        name: 'Low-incline Bench Press',
        purpose: 'A 15–25° angle shifts emphasis closer to the flat bench while keeping some upper-chest involvement.',
        formChange: 'Set the bench lower than a standard incline. Bar path and setup are otherwise identical.',
        difficulty: 'similar',
      },
      {
        name: 'Incline Push-up',
        purpose: 'A bodyweight alternative that mimics the incline pressing angle without equipment.',
        formChange: 'Hands on a bench or elevated surface, feet on the floor. Lower your chest toward the surface.',
        difficulty: 'easier',
      },
      {
        name: 'Incline Cable Press',
        purpose: 'Constant cable tension through the full range of motion; useful as a lighter accessory or finisher.',
        formChange: 'Set a cable at a low anchor point. Press forward and upward at the incline angle.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Use a spotter or safety catches when working with heavy loads on the incline.',
      'Front-shoulder discomfort is more common on the incline than on a flat bench — reduce angle or load if it persists.',
      'Adjust bench angle, grip width, and range of motion to suit your shoulder mobility and goals.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Decline Bench Press ──────────────────────────────────────────────────────
  'decline-bench-press': {
    exerciseKey: 'decline-bench-press',
    displayName: 'Decline Bench Press',
    summary:
      'A barbell pressing movement on a downward-sloped bench that places relatively more emphasis ' +
      'on the lower chest and tends to reduce front-shoulder involvement compared to a flat press.',
    setup: [
      'Set the bench to a 15–30° decline. Most decline benches have foot pads or a hook to keep you in place.',
      'Lie back and secure your feet, then position yourself so the bar is roughly above your lower chest.',
      'Retract and depress your shoulder blades before gripping — the same setup cue as the flat bench.',
      'Grip slightly wider than shoulder width with wrists stacked over your forearms.',
      'The natural arch in your lower back may be more pronounced at a decline — that is normal.',
      'Unrack by pressing straight up, then move the bar over your lower chest.',
    ],
    execution: [
      'Lower the bar with control toward your lower chest or sternum.',
      'Elbows track at roughly 45–75° from your torso — adjust within that range for comfort.',
      'Touch or lightly graze the lower chest, then press back up.',
      'The bar path is generally more vertical on the decline than on an incline.',
      'Avoid pressing the bar toward your face — keep the arc consistent toward the rack.',
    ],
    breathing: [
      'Breathe in and brace before lowering.',
      'Hold the brace through the descent and the press.',
      'Exhale at the top or past the sticking point.',
      'Re-brace between heavy reps rather than letting your core relax at lockout.',
    ],
    cues: [
      '"Squeeze the bar and pull the shoulder blades together" — creates a stable pressing platform.',
      '"Press through the whole foot" — leg tension carries through even at a decline.',
      '"Control the bar, do not chase the chest" — focused lowering yields better muscle engagement.',
      '"Full extension without shrugging" — press to lockout without letting the shoulders roll forward.',
    ],
    commonMistakes: [
      'Letting the bar travel toward the face — the bar path should arc toward the rack, not toward your head.',
      'Using an angle so steep that setup and balance become unstable — 15–30° is a practical working range for most.',
      'Neglecting the shoulder-blade retraction setup — the decline does not remove the need for shoulder stability.',
      'Rushing the descent — a controlled lowering phase improves tension and safety.',
      'Skipping the safety catches or spotter — unracking and re-racking at a decline is harder to bail from.',
    ],
    variations: [
      {
        name: 'Decline Dumbbell Press',
        purpose: 'Independent arm movement; allows a longer range of motion and can reduce wrist strain.',
        formChange: 'Hold a dumbbell in each hand. Press from shoulder height to full extension at the decline angle.',
        difficulty: 'similar',
      },
      {
        name: 'Flat Bench Press',
        purpose: 'Balanced chest, shoulder, and tricep involvement without the positional challenge of a decline.',
        formChange: 'Set the bench flat. Bar lands at the lower chest or sternum. Otherwise identical setup.',
        difficulty: 'similar',
      },
      {
        name: 'Decline Push-up',
        purpose: 'A bodyweight option that mimics the decline angle; feet elevated on a bench or box.',
        formChange: 'Feet on an elevated surface, hands on the floor. Body is at a decline angle. Lower the chest toward the floor.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Use a spotter or safety catches — re-racking at a decline is awkward, especially under fatigue.',
      'Foot pads or hooks must be secure before loading any weight.',
      'Choose a range of motion you can control; the decline bar path can feel unfamiliar at first.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Dumbbell Press ───────────────────────────────────────────────────────────
  'dumbbell-press': {
    exerciseKey: 'dumbbell-press',
    displayName: 'Dumbbell Press',
    summary:
      'A flat pressing movement with dumbbells that trains the chest, front shoulders, and triceps. ' +
      'Each arm moves independently, which can help address left-right strength differences.',
    setup: [
      'Sit on a flat bench with a dumbbell on each knee, then lean back as you kick the weights into position.',
      'Hold the dumbbells at chest level, palms facing forward or angled slightly inward.',
      'Retract and depress your shoulder blades before pressing.',
      'Feet flat on the floor for stability throughout.',
      'A useful starting position has the dumbbells at the sides of your chest, elbows slightly below shoulder level.',
    ],
    execution: [
      'Press the dumbbells upward and slightly inward, stopping just short of touching at the top.',
      'Lower with control, allowing a full stretch at the bottom if your shoulder mobility allows it comfortably.',
      'Elbows track at roughly 45–75° from your torso — adjust for shoulder comfort.',
      'Choose a range of motion you can control; the dumbbells do not need to travel below the bench line if that causes discomfort.',
      'Maintain shoulder-blade position throughout — avoid letting the shoulders roll forward at the top.',
    ],
    breathing: [
      'Breathe in and brace before lowering the dumbbells.',
      'Hold the brace through the descent.',
      'Exhale as you press back up or at the top.',
      'On high-rep sets, breathe rhythmically once per rep rather than holding indefinitely.',
    ],
    cues: [
      '"Palms facing each other at the top" — a slight inward turn can feel more natural at the top of the press.',
      '"Controlled descent" — the lowering phase is where a significant part of the training stimulus comes from.',
      '"Shoulder blades into the bench" — keeps the pressing platform stable.',
      '"Even pressure through both hands" — helps identify and address any side-to-side imbalances.',
    ],
    commonMistakes: [
      'Letting the dumbbells drift too far apart at the bottom — a wide, elbow-out position tends to load the front shoulder excessively.',
      'Pressing the dumbbells together at the top — allows brief muscle relaxation; stopping just short maintains tension better.',
      'Kicking one weight at a time into position asymmetrically — use both knees to position both dumbbells together.',
      'Lowering faster than you can control — aim for roughly two seconds on the descent.',
      'Hyperextending the lower back to get extra range — keep a natural arch rather than an exaggerated one.',
    ],
    variations: [
      {
        name: 'Neutral-grip Dumbbell Press',
        purpose: 'Palms facing each other throughout; tends to feel more comfortable on the wrist and shoulder for some people.',
        formChange: 'Rotate the dumbbells so palms face inward (hammer grip) for the entire set.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Dumbbell Press',
        purpose: 'Trains one side at a time; increases core demand and highlights any strength asymmetry.',
        formChange: 'Hold one dumbbell and keep the opposite hand on your core. Press and lower with one arm, keeping hips level.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Floor Press',
        purpose: 'Limits the range of motion by stopping at the floor; removes lower-back arch and reduces shoulder-joint stress at depth.',
        formChange: 'Lie on the floor instead of a bench. Lower until your upper arms touch the floor, then press back up.',
        difficulty: 'easier',
      },
      {
        name: 'Incline Dumbbell Press',
        purpose: 'Shifts emphasis toward the upper chest by changing the bench angle.',
        formChange: 'Set bench to 30–45°. Same press pattern but the bar path angles more toward the ceiling.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Start with a weight that lets you get the dumbbells into position safely without an awkward setup.',
      'If your shoulder clicks or catches painfully at the bottom of the movement, reduce the range of motion.',
      'Adjust grip angle and range of motion to your shoulder mobility and comfort.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Incline Dumbbell Press ───────────────────────────────────────────────────
  'incline-dumbbell-press': {
    exerciseKey: 'incline-dumbbell-press',
    displayName: 'Incline Dumbbell Press',
    summary:
      'A pressing movement combining an inclined bench and dumbbells, placing relatively more emphasis ' +
      'on the upper chest while allowing each arm to move independently.',
    setup: [
      'Set the bench to 30–45°. Angles above 45° shift more demand toward the front shoulder.',
      'Sit with a dumbbell on each knee, lean back, and use your knees to help kick the weights into position.',
      'Hold the dumbbells at upper-chest level, palms facing forward or angled slightly inward.',
      'Retract and depress your shoulder blades before pressing.',
      'Feet flat on the floor for a stable base throughout.',
    ],
    execution: [
      'Press the dumbbells upward and slightly inward, stopping just short of touching at the top.',
      'Lower under control until the dumbbells are roughly level with your upper chest.',
      'Elbows track at 45–75° from your torso — adjust within that range for shoulder comfort.',
      'A controlled descent through the full range of motion you can comfortably manage is preferable to bouncing or rushing.',
      'Maintain shoulder-blade position throughout the set.',
    ],
    breathing: [
      'Breathe in and brace before lowering.',
      'Hold the brace through the descent.',
      'Exhale as you press or at the top.',
      'Re-brace between heavy reps rather than relaxing at lockout.',
    ],
    cues: [
      '"Elbows slightly below the dumbbells" — a useful check for shoulder-friendly positioning.',
      '"Upper chest to ceiling" — visualising the target can help direct the press path.',
      '"Slow the descent" — two seconds down is a useful target for maintaining control.',
      '"Even grip pressure" — keeps both arms working equally through the set.',
    ],
    commonMistakes: [
      'Bench set too steep — angles above 45° shift most work to the front shoulder.',
      'Letting the elbows flare excessively wide — a moderate elbow angle tends to be more comfortable for the shoulder.',
      'Touching the dumbbells at the top — allows tension to drop; stopping just short keeps the muscles loaded.',
      'Rushing the bottom of the rep — a controlled stretch yields more stimulus than a fast bounce.',
      'Pressing to lockout with the shoulders shrugging forward — keep the blades retracted at the top.',
    ],
    variations: [
      {
        name: 'Incline Barbell Press',
        purpose: 'Allows heavier loading with a fixed bar path; suitable when the goal is maximum pressing strength.',
        formChange: 'Use a barbell on an incline rack. Setup and execution mirror the flat barbell bench press, adjusted for the angle.',
        difficulty: 'similar',
      },
      {
        name: 'Low-incline Dumbbell Press',
        purpose: 'A 15–25° incline keeps more chest involvement while slightly reducing front-shoulder demand.',
        formChange: 'Set the bench lower than a standard incline. All other technique cues apply.',
        difficulty: 'similar',
      },
      {
        name: 'Neutral-grip Incline Press',
        purpose: 'Palms-facing grip can reduce wrist and shoulder strain for some people.',
        formChange: 'Rotate dumbbells to a neutral (hammer) grip throughout the set on the incline bench.',
        difficulty: 'similar',
      },
      {
        name: 'Incline Push-up',
        purpose: 'Bodyweight alternative that approximates the incline pressing angle without equipment.',
        formChange: 'Hands on a bench or elevated surface, feet on the floor. Lower your chest toward the surface.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Front-shoulder discomfort on the incline is common — reducing angle or load is often an effective first adjustment.',
      'Start with a manageable weight until the setup and unrack feel controlled.',
      'Adjust bench angle, grip orientation, and range of motion to your shoulder mobility and goals.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Chest Fly ────────────────────────────────────────────────────────────────
  'chest-fly': {
    exerciseKey: 'chest-fly',
    displayName: 'Chest Fly',
    summary:
      'A dumbbell isolation movement that trains the chest through a wide arc, ' +
      'emphasising the stretch and contraction of the pectoral muscles with relatively little tricep demand.',
    setup: [
      'Lie flat on a bench with a dumbbell in each hand, pressed to full extension above your chest.',
      'Palms facing each other, a slight bend in the elbows — maintain this elbow angle throughout the set.',
      'Retract your shoulder blades and keep them pressed into the bench.',
      'Feet flat on the floor for stability.',
      'The slight elbow bend reduces joint stress; do not straighten the arms completely during the movement.',
    ],
    execution: [
      'Lower the dumbbells in a wide arc, leading with your elbows rather than your hands.',
      'Descend until you feel a comfortable stretch in your chest — roughly when your upper arms are level with the bench or slightly below.',
      'Reverse the arc and bring the dumbbells back together above your chest, squeezing the chest at the top.',
      'Choose a range of motion you can control comfortably; do not force a deep stretch past where the shoulder feels stable.',
      'Move smoothly throughout — avoid jerking at the bottom or bouncing the dumbbells together at the top.',
    ],
    breathing: [
      'Breathe in as you lower the dumbbells through the arc.',
      'Breathe out as you bring them back together.',
      'On lighter sets, breathe rhythmically once per rep.',
      'Avoid holding your breath for multiple consecutive reps.',
    ],
    cues: [
      '"Hug a barrel" — imagine wrapping your arms around a large curved object; this shapes the arc.',
      '"Elbows stay slightly bent" — a fixed, gentle bend protects the elbow joint throughout.',
      '"Lead with the elbows, not the hands" — keeps the movement in the chest rather than turning it into a press.',
      '"Squeeze at the top, pause briefly" — makes the contraction more deliberate.',
    ],
    commonMistakes: [
      'Straightening the elbows fully — this turns the movement into a partial press and increases elbow-joint stress.',
      'Lowering too deeply — excessive depth below the bench level can overstress the shoulder joint.',
      'Using too much weight — the chest fly is a detail movement; heavy loading usually compromises the arc and control.',
      'Bouncing the dumbbells at the bottom — use a smooth reversal of the arc instead.',
      'Pressing at the top rather than closing the arc — keep the elbow bend constant and focus on bringing the arms together.',
    ],
    variations: [
      {
        name: 'Incline Dumbbell Fly',
        purpose: 'The inclined angle shifts relatively more emphasis toward the upper chest.',
        formChange: 'Set bench to 30–45°. Same fly arc, but the movement is directed away from the chest at a steeper angle.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Fly',
        purpose: 'Cables maintain tension throughout the full arc, unlike dumbbells which lose tension at the top.',
        formChange: 'Set cables at chest height or above. Step forward and perform the same arc with constant cable tension.',
        difficulty: 'similar',
      },
      {
        name: 'Pec Deck / Machine Fly',
        purpose: 'A machine guides the arc; useful when learning the movement pattern or working around dumbbell availability.',
        formChange: 'Sit at the machine, adjust the seat so handles are at chest level, and follow the guided arc.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'The chest fly places significant stress on the shoulder joint at the bottom of the arc — start with light weight and increase gradually.',
      'Pain at the front of the shoulder during the stretch is a signal to reduce range of motion or load.',
      'Maintain the slight elbow bend throughout — never lock out the elbows during the lowering phase.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Cable Fly ────────────────────────────────────────────────────────────────
  'cable-fly': {
    exerciseKey: 'cable-fly',
    displayName: 'Cable Fly',
    summary:
      'A cable-based chest exercise that maintains tension through the full arc of the movement. ' +
      'Cable angle can be adjusted to emphasise different portions of the chest.',
    setup: [
      'Set the cable pulleys at chest height (or above for a downward arc, or below for an upward arc).',
      'Stand in the centre of the cable station, one foot slightly forward for balance.',
      'Hold a handle in each hand with palms facing each other or slightly upward.',
      'Lean forward slightly from the hips — a subtle forward lean helps align the cable tension with your chest.',
      'Maintain a slight bend in both elbows throughout the set.',
    ],
    execution: [
      'Bring both handles together in front of your chest in a wide, controlled arc.',
      'At the meeting point, squeeze the chest and hold briefly before returning.',
      'Open the arms back under control, feeling the stretch in the chest without allowing the shoulder to roll forward excessively.',
      'Keep the elbow angle consistent throughout — the movement should feel like you are hugging rather than pressing.',
      'Choose a range of motion you can control comfortably; do not let the cables yank the arms behind your torso.',
    ],
    breathing: [
      'Breathe in as you open the arms (the stretch phase).',
      'Breathe out as you bring the handles together.',
      'Keep breathing rhythmically throughout the set.',
      'Avoid holding your breath across multiple reps.',
    ],
    cues: [
      '"Hug a barrel" — the same arc cue that applies to dumbbell flies.',
      '"Constant tension on the chest" — cables pull throughout the arc, so you can feel the muscles working at every point.',
      '"Elbows soft throughout" — a fixed gentle bend protects the joint and keeps the chest as the primary mover.',
      '"Tall posture" — avoid hunching forward; a slight lean is intentional but excessive forward rounding loses stability.',
    ],
    commonMistakes: [
      'Letting the arms drift too far back — the cables can pull the arms behind the torso if control is lost, stressing the shoulder.',
      'Turning the movement into a press by straightening the elbows — keep the arc consistent.',
      'Leaning too far forward — some forward lean is useful, but excessive lean shifts the movement pattern significantly.',
      'Using momentum to bring the handles together — slow down the arc for more muscle engagement.',
      'Standing with feet together — a staggered stance provides better balance against the cable pull.',
    ],
    variations: [
      {
        name: 'High-to-low Cable Fly',
        purpose: 'Cables set above shoulder height; the downward arc places relatively more emphasis on the lower chest.',
        formChange: 'Set the pulleys high. Pull the handles downward and together in front of your lower abdomen.',
        difficulty: 'similar',
      },
      {
        name: 'Low-to-high Cable Fly',
        purpose: 'Cables set below waist height; the upward arc tends to emphasise the upper chest.',
        formChange: 'Set the pulleys low. Pull the handles upward and together in front of your upper chest.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Cable Fly',
        purpose: 'Trains one side at a time; useful for addressing left-right differences and increasing core demand.',
        formChange: 'Hold one handle and brace the opposite hand on your hip or a support. Perform the arc with one arm.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Fly',
        purpose: 'A free-weight alternative that requires no cable machine; tension is highest at the bottom of the arc.',
        formChange: 'Lie on a flat bench. Perform the same arc with dumbbells, maintaining the slight elbow bend.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Begin with a light load to learn the arc before adding weight — control matters more than cable load here.',
      'If the cables pull your arms too far back, reduce the weight or shorten your range of motion.',
      'Adjust pulley height and stance to your comfort and what portion of the chest you want to emphasise.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Dips ─────────────────────────────────────────────────────────────────────
  'dips': {
    exerciseKey: 'dips',
    displayName: 'Dips',
    summary:
      'A bodyweight pressing movement performed on parallel bars that trains the chest, triceps, and front ' +
      'shoulders. Leaning forward during the dip places relatively more emphasis on the lower chest; ' +
      'staying more upright shifts demand toward the triceps.',
    setup: [
      'Grip both parallel bars and press yourself up to a straight-arm support position.',
      'A wider bar spacing generally allows more forward lean for chest emphasis; narrower spacing tends to keep the torso more upright.',
      'To emphasise the chest, lean your torso forward roughly 30–45° and allow your elbows to flare moderately outward.',
      'Cross your ankles or let your legs hang — choose what feels most stable.',
      'Brace your core before beginning each rep.',
    ],
    execution: [
      'Lower yourself by bending the elbows, maintaining your chosen torso angle throughout.',
      'Descend until your upper arms are roughly parallel to the floor, or to the depth you can control comfortably.',
      'Push back up to full elbow extension without letting the torso angle change significantly mid-rep.',
      'A controlled descent is more valuable than a fast one — aim for a smooth two-to-three second lowering phase.',
      'Avoid shrugging the shoulders toward the ears at the bottom — keep them pressed away from your head.',
    ],
    breathing: [
      'Breathe in as you lower.',
      'Breathe out as you press back up.',
      'On weighted dips, brace firmly before descending and exhale at or just past the sticking point.',
      'Keep breathing consistently across the set rather than holding your breath for multiple reps.',
    ],
    cues: [
      '"Lean forward for the chest" — the torso angle is the primary way to shift emphasis between chest and triceps.',
      '"Elbows back, not out" — when aiming for tricep emphasis; "elbows moderate" when aiming for chest.',
      '"Shoulders down, not shrugged" — keep the shoulder blades depressed to protect the joint at the bottom.',
      '"Control the descent" — rushing the lowering phase reduces control and shoulder joint safety.',
    ],
    commonMistakes: [
      'Descending too quickly — a fast drop reduces muscle engagement and puts sudden stress on the shoulder.',
      'Going too deep before shoulder strength and mobility are ready — build depth gradually over time.',
      'Shrugging the shoulders at the bottom — the shoulder blades should stay depressed throughout.',
      'Swinging the legs for momentum — momentum shifts work away from the target muscles.',
      'Pressing back up without maintaining the torso angle — the angle should be consistent from bottom to top.',
    ],
    variations: [
      {
        name: 'Bench Dip',
        purpose: 'A supported version using a bench behind you; reduces the bodyweight load and is easier to learn on.',
        formChange: 'Place hands on a bench behind you, feet on the floor or an elevated surface. Bend the elbows to lower, then press back up.',
        difficulty: 'easier',
      },
      {
        name: 'Assisted Dip (machine or band)',
        purpose: 'Reduces the effective bodyweight; useful when building up to full unassisted dips.',
        formChange: 'Use a band looped around the bars and under your knees, or an assisted dip machine. Perform the same movement pattern.',
        difficulty: 'easier',
      },
      {
        name: 'Weighted Dip',
        purpose: 'Adds load beyond bodyweight; a natural progression once unassisted dips are well-controlled.',
        formChange: 'Attach a weight plate or kettlebell via a dip belt. Perform the same movement. Maintain your torso angle.',
        difficulty: 'harder',
      },
      {
        name: 'Ring Dip',
        purpose: 'Gymnastic rings require significantly more stabilisation and increase the difficulty substantially.',
        formChange: 'Perform dips on gymnastic rings instead of fixed bars. The rings will move; controlling this is the added challenge.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Shoulder discomfort at the bottom of a dip is common — reduce depth until shoulder strength catches up.',
      'Build up depth and load gradually; dips place real stress on the shoulder at full depth.',
      'Adjust your torso angle and elbow flare to your comfort and training goal.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Pec Deck ─────────────────────────────────────────────────────────────────
  'pec-deck': {
    exerciseKey: 'pec-deck',
    displayName: 'Pec Deck',
    summary:
      'A machine-based chest exercise that guides the arms through a fly arc, providing chest training ' +
      'with less balance demand than dumbbells. The fixed path can be useful for learning the movement pattern.',
    setup: [
      'Adjust the seat height so that the handles or pads are at chest level when you sit upright.',
      'Sit with your back flat against the pad and your feet flat on the floor.',
      'Grip the handles or place your forearms on the pads, depending on the machine design.',
      'Keep your back in contact with the support pad throughout — avoid rounding forward.',
      'A slight forward lean is not necessary on most pec-deck designs; the machine guides the arc.',
    ],
    execution: [
      'Bring the handles or pads together in front of your chest in a smooth, controlled arc.',
      'Squeeze the chest at the midpoint — this is where the tension is highest on a pec deck.',
      'Return under control, opening the arms until you feel a comfortable stretch in the chest.',
      'Do not allow the weight stack to crash down between reps — maintain control of the negative.',
      'Choose a range of motion you can control; do not let the arms travel so far back that the shoulder rolls forward.',
    ],
    breathing: [
      'Breathe out as you bring the arms together.',
      'Breathe in as you open them back.',
      'Keep breathing rhythmically throughout the set.',
      'For heavier loads, brace during the squeeze and exhale at the fully contracted position.',
    ],
    cues: [
      '"Chest to meet the hands, not hands to meet each other" — focuses attention on the pecs rather than just the arm movement.',
      '"Controlled opening" — the return phase should be just as deliberate as the closing phase.',
      '"Back on the pad" — keeping contact with the support ensures the chest, not the shoulders, does the work.',
      '"Pause at the squeeze" — a brief hold at full contraction increases time under tension.',
    ],
    commonMistakes: [
      'Using a range of motion that opens the arms too far back — this can overstress the front of the shoulder on some machine designs.',
      'Letting the weight stack touch between reps — loses tension and control; stop just short.',
      'Pulling with the arms rather than the chest — think of moving the upper arms, not gripping harder.',
      'Setting the seat too high or low — handles not at chest level changes the effective muscle emphasis.',
      'Rushing the return — the negative is training too; control it.',
    ],
    variations: [
      {
        name: 'Dumbbell Fly',
        purpose: 'A free-weight alternative that requires more balance but allows a more natural arc.',
        formChange: 'Lie on a flat bench with dumbbells. Perform the same arc movement with a slight elbow bend.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Fly',
        purpose: 'Maintains constant tension throughout the arc; adjustable pulley height changes chest emphasis.',
        formChange: 'Set cables at chest height. Stand between the pulleys and bring the handles together in a fly arc.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Pec Deck',
        purpose: 'Trains one side at a time; useful for noticing and addressing left-right differences.',
        formChange: 'Adjust the machine to one-arm mode or hold one handle only. Perform the arc with a single arm.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Adjust the machine range of motion so your arms do not travel behind your torso — most machines have a stop for this.',
      'Front-shoulder discomfort during the stretch phase is a signal to reduce range of motion or load.',
      'Set the seat correctly before loading weight — the pad height significantly affects shoulder-joint loading.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Floor Press ────────────────────────────────────────────────────
  'kettlebell-floor-press': {
    exerciseKey: 'kettlebell-floor-press',
    displayName: 'Kettlebell Floor Press',
    summary:
      'A pressing movement performed lying on the floor with a kettlebell, which limits the range of ' +
      'motion at the bottom and can reduce shoulder-joint stress. A useful option when a bench is unavailable.',
    setup: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Hold the kettlebell by the handle in one hand (or one in each hand for bilateral pressing), resting on the back of the forearm.',
      'Position the upper arm at roughly 45° from your torso on the floor before pressing.',
      'The bell rests against the back of your forearm and wrist — keep that contact point throughout.',
      'Brace your core and press the lower back gently into the floor.',
    ],
    execution: [
      'Press the kettlebell straight up until the arm reaches full extension.',
      'Lower under control until your elbow or upper arm makes contact with the floor.',
      'Pause briefly at the bottom before the next rep — this removes momentum and resets the brace.',
      'Keep the wrist straight throughout — the kettlebell handle should remain in line with the forearm.',
      'For unilateral (single-arm) pressing, keep the non-working arm extended on the floor or bent with its elbow on the ground.',
    ],
    breathing: [
      'Breathe in before lowering, bracing firmly.',
      'Hold the brace through the lowering phase.',
      'Exhale as you press up.',
      'For single-arm work, re-brace between reps as needed.',
    ],
    cues: [
      '"Wrist over forearm" — a straight wrist keeps the load stacked efficiently.',
      '"Elbow to floor, pause" — a deliberate pause removes the stretch-reflex advantage and keeps the reps honest.',
      '"Press straight, not toward your face" — the bar path should be vertical.',
      '"Bell stays on the forearm" — the resting position of the bell should feel stable, not tipping.',
    ],
    commonMistakes: [
      'Letting the wrist break backward — a collapsed wrist shifts load onto the joint rather than the muscles.',
      'Bouncing the elbow off the floor — use a controlled touch-and-press rather than a bounce.',
      'Pressing at an angle toward the face or feet — the press should travel straight up.',
      'Using a load too heavy to control — the floor removes the full stretch, but uncontrolled weight is still unsafe.',
      'Skipping the pause at the bottom — the pause is a key feature of the floor press; using it distinguishes it from a bench press.',
    ],
    variations: [
      {
        name: 'Dumbbell Floor Press',
        purpose: 'Replaces the kettlebell with dumbbells; may feel more stable for those new to the floor press.',
        formChange: 'Hold a dumbbell in each hand. Lower until upper arms touch the floor, then press back up.',
        difficulty: 'similar',
      },
      {
        name: 'Barbell Floor Press',
        purpose: 'Allows heavier loading; requires a rack or a partner to get into position safely.',
        formChange: 'Lie below a rack with pins set low, or have a partner hand you the bar. Same floor press pattern.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Kettlebell Floor Press',
        purpose: 'Trains one side independently; increases the anti-rotation core demand.',
        formChange: 'Press with one arm only. Keep the opposite arm relaxed or braced on the floor.',
        difficulty: 'similar',
      },
      {
        name: 'Bench Press',
        purpose: 'Full range of motion pressing with a bench; removes the floor depth-limit.',
        formChange: 'Use a flat bench. The bar or dumbbells can travel below chest level for a fuller stretch.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Getting a heavy kettlebell into the floor press starting position requires care — start light and learn the setup.',
      'If the wrist feels strained, reduce load and focus on maintaining a straight wrist throughout.',
      'Adjust range of motion and load to your shoulder mobility and comfort.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Pullover ───────────────────────────────────────────────────────
  'kettlebell-pullover': {
    exerciseKey: 'kettlebell-pullover',
    displayName: 'Kettlebell Pullover',
    summary:
      'A lying overhead movement that trains the chest, lats, serratus anterior, and core through a ' +
      'sweeping arc from overhead to above the chest. It is one of the few exercises that involves ' +
      'both a pushing and pulling muscle group simultaneously.',
    setup: [
      'Lie on a flat bench, perpendicular to it if you want a full shoulder stretch — or fully lengthwise if you prefer a more supported setup.',
      'Hold the kettlebell by the horns (the sides of the handle) with both hands, pressing it above your chest to start.',
      'Feet flat on the floor, core lightly braced.',
      'Maintain a slight bend in the elbows throughout — do not straighten the arms completely.',
      'Begin with a weight that feels manageable; the overhead position can feel unfamiliar at first.',
    ],
    execution: [
      'Lower the kettlebell in an arc overhead, keeping the elbows slightly bent.',
      'Descend until you feel a comfortable stretch in the chest and lats — roughly until the arms are roughly parallel to the floor or slightly below.',
      'Reverse the arc, pulling the kettlebell back to the starting position above your chest.',
      'Focus on moving the arms from the shoulder joint, not pulling with the hands.',
      'Choose a range of motion you can control; do not lower past a point where your lower back arches excessively off the bench.',
    ],
    breathing: [
      'Breathe in as you lower the kettlebell overhead.',
      'Breathe out as you pull it back to the starting position.',
      'A light brace through the movement helps stabilise the ribcage.',
      'Avoid gasping or holding your breath for multiple reps.',
    ],
    cues: [
      '"Arc, not press" — this is a sweeping movement, not a push.',
      '"Feel the stretch" — the bottom of the arc should feel like a comfortable chest and lat stretch.',
      '"Elbows slightly bent" — straight arms increase elbow-joint stress through the arc.',
      '"Core lightly on" — a braced midsection keeps the lower back from arching away from the bench.',
    ],
    commonMistakes: [
      'Lowering too far overhead — excessive range of motion can strain the shoulder or cause the lower back to peel off the bench.',
      'Straightening the elbows — this turns the arc into a straight-arm pullover with more joint stress.',
      'Pulling with the hands rather than leading with the elbows — limits the contribution of the target muscles.',
      'Using too much weight — the pullover is a moderate-load exercise where control of the arc matters more than load.',
      'Lifting the hips off the bench — keep contact to maintain a stable base.',
    ],
    variations: [
      {
        name: 'Dumbbell Pullover',
        purpose: 'A classic alternative using a single dumbbell; held by one end in both hands.',
        formChange: 'Grip one end of a dumbbell with both hands in a diamond grip. Same arc pattern.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Pullover',
        purpose: 'A cable attachment maintains tension at the top of the arc, unlike free weights.',
        formChange: 'Set a cable at a high anchor behind your head. Pull the handle in a downward arc from overhead to your hips while standing or kneeling.',
        difficulty: 'similar',
      },
      {
        name: 'Straight-arm Lat Pulldown',
        purpose: 'Mimics the pullover motion in a standing position with consistent cable tension.',
        formChange: 'Stand at a cable station with a high pulley. Keep arms nearly straight and pull the bar to your hips in a wide arc.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Do not force the range of motion overhead — the stretch should feel productive, not painful.',
      'Shoulder or elbow discomfort during the arc is a signal to reduce the range of motion or load.',
      'Adjust the bench position and elbow bend to suit your shoulder mobility.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Pike Push-ups ─────────────────────────────────────────────────────────────
  'pike-push-ups': {
    exerciseKey: 'pike-push-ups',
    displayName: 'Pike Push-ups',
    summary:
      'A bodyweight pressing movement performed in an inverted-V position that places relatively ' +
      'more emphasis on the shoulders and upper chest compared to standard push-ups. ' +
      'Often used as a stepping stone toward handstand push-ups.',
    setup: [
      'Start in a high push-up position, then walk your feet toward your hands until your hips are high and your body forms an inverted V.',
      'Hands roughly shoulder-width apart, fingers spread for stability.',
      'Aim to keep your head between your arms — the top of your head points toward the floor.',
      'Legs as straight as your hamstring mobility allows; bent knees are fine if straight legs are uncomfortable.',
      'Brace your core to maintain the pike shape throughout the set.',
    ],
    execution: [
      'Lower the top of your head toward the floor between your hands by bending your elbows.',
      'Elbows flare outward moderately — this is the natural shoulder-press movement pattern.',
      'Descend to a depth your shoulders can control comfortably, without letting your hips drop.',
      'Press back up to full elbow extension, returning to the pike position.',
      'Keep the hips elevated throughout — if they drop significantly, you are shifting toward a regular push-up.',
    ],
    breathing: [
      'Breathe in as you lower.',
      'Breathe out as you press back up.',
      'Keep breathing steadily; the inverted position can feel unfamiliar at first.',
      'Avoid holding your breath across multiple reps.',
    ],
    cues: [
      '"Hips stay high" — the pike angle is what makes the movement shoulder-dominant.',
      '"Head between the hands at the bottom" — targets the correct pressing direction.',
      '"Straight elbows at the top" — full extension is the goal at the top of each rep.',
      '"Walk feet in for more shoulder challenge" — a steeper pike increases the shoulder demand.',
    ],
    commonMistakes: [
      'Hips dropping as you lower — this turns the movement into a regular push-up; re-establish the pike before continuing.',
      'Looking forward instead of down — looking forward can stress the neck; keep the gaze toward the floor.',
      'Hands placed too wide — shoulder-width is a useful starting point; very wide placement can reduce range of motion.',
      'Insufficient pike depth — if the hips are not elevated, the movement does not challenge the shoulders as intended.',
      'Rushing the descent — controlled lowering is more effective and safer for the shoulder joint.',
    ],
    variations: [
      {
        name: 'Elevated Pike Push-up',
        purpose: 'Feet on a box or bench increase the effective angle, placing more demand on the shoulder.',
        formChange: 'Place feet on an elevated surface and perform the pike push-up from that position.',
        difficulty: 'harder',
      },
      {
        name: 'Standard Push-up',
        purpose: 'A lower-intensity horizontal pressing option if the pike position is not yet comfortable.',
        formChange: 'Body stays in a plank rather than a pike. Lower the chest toward the floor.',
        difficulty: 'easier',
      },
      {
        name: 'Handstand Push-up',
        purpose: 'The full vertical pressing progression; requires significant shoulder strength and balance.',
        formChange: 'Kick up to a handstand against a wall. Lower the head toward the floor and press back up.',
        difficulty: 'harder',
      },
      {
        name: 'Dumbbell Shoulder Press',
        purpose: 'An equipment-based alternative that trains the same vertical pressing pattern with adjustable load.',
        formChange: 'Seated or standing, press dumbbells from shoulder height to full extension overhead.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Build shoulder strength with standard push-ups and overhead pressing before progressing to pike push-ups.',
      'Wrist discomfort is common in the inverted position — try using push-up handles or performing on fists.',
      'Do not force depth before you have the shoulder strength to control it.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Archer Push-ups ──────────────────────────────────────────────────────────
  'archer-push-ups': {
    exerciseKey: 'archer-push-ups',
    displayName: 'Archer Push-ups',
    summary:
      'An asymmetric push-up variation where one arm bends to lower the body while the other stays ' +
      'extended to the side. This shifts most of the pressing demand onto the working arm, ' +
      'making it a useful progression toward the one-arm push-up.',
    setup: [
      'Begin in a wide-stance push-up position with hands placed significantly wider than shoulder width.',
      'Fingers of both hands can point forward or angled slightly outward.',
      'Keep your body in a straight line from head to heels — core and glutes engaged.',
      'Decide which arm will do the first lowering rep; the opposite arm will stay extended.',
      'Build baseline pressing strength with standard and close-grip push-ups before attempting this variation.',
    ],
    execution: [
      'Shift your weight toward one arm and lower your body toward that side by bending only that elbow.',
      'The opposite arm stays extended, tracking alongside your body as you descend — ideally staying relatively straight.',
      'Lower until your chest is close to the floor on the bending-arm side.',
      'Press back up through the bending arm to return to the wide starting position.',
      'Alternate sides each rep, or complete a set on one side before switching.',
    ],
    breathing: [
      'Breathe in as you lower toward the working side.',
      'Breathe out as you press back up.',
      'Keep breathing consistently; do not hold your breath through a full alternating set.',
    ],
    cues: [
      '"Shift and lower" — the lateral weight transfer is the key movement before the elbow bends.',
      '"Extended arm stays active, not limp" — maintain slight tension in the outstretched arm.',
      '"Core stays solid" — rotation or hip sag reduces the effectiveness and control of the movement.',
      '"Control the return" — press back to the wide start position rather than flopping back.',
    ],
    commonMistakes: [
      'Hips rotating during the lowering phase — the body should move as a unit without twisting.',
      'Extended arm bending too much — if the extended arm bends significantly, the movement is closer to a standard push-up.',
      'Rushing between sides — each rep should have a deliberate lateral shift, not a side-to-side bounce.',
      'Starting too wide without sufficient shoulder strength — if you cannot lower with control, reduce the width or build with standard push-ups first.',
      'Wrists under stress from the wide position — adjust hand angle or use push-up handles.',
    ],
    variations: [
      {
        name: 'Standard Push-up',
        purpose: 'A prerequisite movement; build general pressing strength here before adding asymmetry.',
        formChange: 'Hands shoulder-width apart. Lower the chest straight toward the floor.',
        difficulty: 'easier',
      },
      {
        name: 'Assisted Archer Push-up',
        purpose: 'Use a fist or angled fingers on the extended arm to reduce the demand slightly.',
        formChange: 'Rest the extended arm on a fist — the slight height difference offers a small assist to the working side.',
        difficulty: 'easier',
      },
      {
        name: 'One-arm Push-up',
        purpose: 'The full single-arm progression; the opposite hand is fully removed from the floor.',
        formChange: 'Lower with one arm only, feet wide for balance, hand centred below the chest.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Build solid standard push-up strength before attempting archer push-ups — this is a demanding progression.',
      'Wrist and shoulder discomfort at the wide position is a signal to reduce hand spacing or use handles.',
      'Adjust the width of your stance and the degree of lateral shift to your current strength level.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Diamond Push-ups ─────────────────────────────────────────────────────────
  'diamond-push-ups': {
    exerciseKey: 'diamond-push-ups',
    displayName: 'Diamond Push-ups',
    summary:
      'A close-grip push-up variation with hands positioned to form a diamond shape beneath the chest. ' +
      'This places relatively more emphasis on the triceps and inner chest compared to standard push-ups.',
    setup: [
      'Start in a standard push-up position, then bring both hands together beneath your chest.',
      'Touch the thumbs and index fingers of each hand to form a rough diamond or triangle shape.',
      'Your hands should be roughly below your lower chest or sternum.',
      'Keep your body in a straight line from head to heels throughout — core and glutes engaged.',
      'Elbows will track close to your torso during the movement — this is intentional.',
    ],
    execution: [
      'Lower your chest toward the diamond shape, keeping your elbows close to your sides.',
      'Descend until your chest nearly touches your hands or to the depth you can control.',
      'Press back up to full extension, maintaining the close elbow position throughout.',
      'If the hand position causes wrist discomfort, try rotating hands slightly outward to find a more comfortable angle.',
      'Avoid letting the hips sag or rise — the same plank alignment as a standard push-up applies.',
    ],
    breathing: [
      'Breathe in as you lower.',
      'Breathe out as you press back up.',
      'Keep breathing rhythmically throughout the set.',
    ],
    cues: [
      '"Elbows track toward the hips" — keeping elbows close is what loads the triceps preferentially.',
      '"Chest to the diamond" — the target point for the descent is the hand position.',
      '"Rigid plank" — the same whole-body tension cue as any push-up variation.',
      '"Controlled wrist position" — if the hands feel forced, adjust the angle slightly.',
    ],
    commonMistakes: [
      'Elbows flaring outward — this moves the exercise closer to a standard push-up and reduces tricep emphasis.',
      'Hands placed too far forward under the face — position them under the lower chest or sternum, not under the chin.',
      'Wrist collapsing or straining — adjust hand angle, or use push-up handles or fists to reduce wrist extension.',
      'Hips sagging — a sign the core is not engaged; build plank strength first.',
      'Partial reps without building to a comfortable depth — increase depth gradually.',
    ],
    variations: [
      {
        name: 'Standard Push-up',
        purpose: 'A lower-intensity starting point; build general pressing strength before the close-grip variation.',
        formChange: 'Hands shoulder-width apart. Lower the chest toward the floor.',
        difficulty: 'easier',
      },
      {
        name: 'Close-grip Bench Press',
        purpose: 'The barbell equivalent; allows load adjustment and is useful for building tricep pressing strength.',
        formChange: 'Grip the bar slightly inside shoulder width on a flat bench. Elbows stay close during the press.',
        difficulty: 'similar',
      },
      {
        name: 'Tricep Dips',
        purpose: 'A bodyweight tricep exercise with a different movement plane; useful for additional tricep volume.',
        formChange: 'Grip parallel bars or a bench behind you. Lower the body by bending the elbows, keeping them close.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Wrist discomfort is common in the close-grip position — adjust hand angle or use push-up handles.',
      'Elbow pain during or after diamond push-ups is a signal to reduce volume or check that your elbows are not flaring.',
      'Build general push-up strength before using this close-grip variation.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Pseudo Planche Push-ups ───────────────────────────────────────────────────
  'pseudo-planche-push-ups': {
    exerciseKey: 'pseudo-planche-push-ups',
    displayName: 'Pseudo Planche Push-ups',
    summary:
      'An advanced push-up variation with the hands positioned at hip level and the body leaning ' +
      'far forward over the hands. This creates a horizontal pressing demand similar to a planche ' +
      'and places significant load on the front shoulders and chest.',
    setup: [
      'Begin in a standard push-up position, then walk your hands back toward your hips — roughly beside your lower ribs or hips depending on your strength level.',
      'Fingers point forward, sideways, or slightly backward; find the angle that is comfortable for your wrists.',
      'Protract (round) your shoulder blades slightly — this is the key planche body position.',
      'Lean your bodyweight forward over your hands until your shoulders are in front of your wrists.',
      'The degree of forward lean determines the difficulty — more lean means more demand on the front shoulder.',
    ],
    execution: [
      'Lower your body by bending the elbows while maintaining the forward lean.',
      'Keep the shoulder blades protracted throughout — do not let them pinch together.',
      'Descend to a depth you can control, then press back up to full extension.',
      'The hips should stay in line with the body — avoid piking or letting the hips rise.',
      'This is a skill movement; fewer reps with better position is more valuable than more reps with poor lean and retracted shoulders.',
    ],
    breathing: [
      'Breathe in as you lower.',
      'Breathe out as you press back up.',
      'Core bracing is particularly important here given the forward-lean body position.',
      'Do not hold your breath across multiple reps.',
    ],
    cues: [
      '"Shoulders forward of the wrists" — the lean is what differentiates this from a standard push-up.',
      '"Round the back slightly" — scapular protraction is a core technique element of planche training.',
      '"Stay rigid" — the body should move as a single unit, not fold at the hips.',
      '"Build the lean gradually" — a small increase in lean over time is the progression path.',
    ],
    commonMistakes: [
      'Hands too far back without sufficient shoulder strength — increase hand-back distance progressively.',
      'Shoulder blades retracting during the press — protraction should be maintained throughout.',
      'Hips piking upward — the body line should stay as flat as possible given the forward lean.',
      'Wrists at a painful angle — adjust finger direction; some people prefer to turn fingers to the side.',
      'Skipping prerequisite strength — this movement requires solid standard push-up and dip strength as a foundation.',
    ],
    variations: [
      {
        name: 'Lean-forward Push-up (beginner)',
        purpose: 'A very slight forward lean to introduce the shoulder and scapular protraction demand.',
        formChange: 'Standard push-up with hands slightly behind the shoulder line. Just a small lean rather than full pseudo-planche position.',
        difficulty: 'easier',
      },
      {
        name: 'Planche Lean Hold',
        purpose: 'An isometric hold in the pseudo-planche start position without performing the push-up.',
        formChange: 'Take the forward-lean position and hold it statically for time, focusing on protraction and straight body position.',
        difficulty: 'easier',
      },
      {
        name: 'Tuck Planche Push-up',
        purpose: 'A more advanced variation where the knees are tucked toward the chest, elevating the legs off the floor.',
        formChange: 'From the pseudo-planche position, tuck the knees to the chest so feet are off the floor. Then perform the push-up.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'This is an advanced movement — build a solid foundation with standard push-ups, dips, and shoulder pressing before attempting.',
      'Wrist discomfort is common; try push-up handles, parallel bars, or adjusting finger direction.',
      'Shoulder discomfort from the extreme forward position is a signal to reduce the lean or return to a prerequisite.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Muscle-ups ────────────────────────────────────────────────────────────────
  'muscle-ups': {
    exerciseKey: 'muscle-ups',
    displayName: 'Muscle-ups',
    summary:
      'A compound upper-body movement combining a pulling phase (similar to a pull-up) with a ' +
      'pushing phase (similar to a dip) to transition from below a bar or rings to a supported ' +
      'position above it. Requires significant pulling strength, coordination, and body awareness.',
    setup: [
      'Grip a pull-up bar or gymnastic rings with an overhand or false grip (false grip wraps the wrist over the bar for ring muscle-ups).',
      'Hang at full extension with a slight shoulder engagement — do not hang completely passive.',
      'A false grip on rings is important for smooth transition; on a straight bar, wrist flexibility and a strong pull compensate.',
      'Build prerequisite strength: solid pull-ups and bar dips before attempting muscle-ups.',
      'A kipping muscle-up uses hip drive to assist the transition; a strict muscle-up requires more raw pulling and pressing strength.',
    ],
    execution: [
      'Pull explosively, aiming to bring your chest to the bar or your hips to ring height rather than just your chin.',
      'As you reach the top of the pull, transition your grip and lean forward to get your hips over the bar or your chest over the rings.',
      'Once the transition is complete, press to full extension in the dip position.',
      'Lower yourself back under control by reversing the dip first, then the transition, then the pull.',
      'The transition is the most technically demanding phase — expect to drill it separately before linking the full movement.',
    ],
    breathing: [
      'Take a breath in and brace before initiating the pull.',
      'Exhale during the dip press phase or at the top.',
      'Re-brace for each rep if doing multiple reps.',
      'Do not hold your breath through a full set of multiple reps.',
    ],
    cues: [
      '"Pull to the hips, not the chin" — the goal is to pull higher than a standard pull-up to enable the transition.',
      '"Lean forward in the transition" — getting the hips over the bar requires a forward body lean at the top of the pull.',
      '"Press to lockout" — the dip portion is a complete press, not a partial extension.',
      '"Control the negative" — a slow, deliberate descent drills the transition and builds strength.',
    ],
    commonMistakes: [
      'Attempting muscle-ups without sufficient pull-up and dip strength — a solid baseline of 5–10 clean pull-ups and dips is a useful prerequisite.',
      'Pulling only to chin level — the bar must reach at least chest level to allow the transition.',
      'Crashing through the transition — the lean and grip change need to be practised as a deliberate skill.',
      'Relying entirely on a kipping swing before the pull is strong enough — build pulling strength first.',
      'Skipping the negative — practising the lowering phase builds the transition control needed for clean reps.',
    ],
    variations: [
      {
        name: 'Jumping Muscle-up',
        purpose: 'Uses a jump from the ground to add momentum; useful for learning the transition pattern.',
        formChange: 'Stand below a low bar. Jump and use the momentum to help pull and transition. Focus on the transition mechanics.',
        difficulty: 'easier',
      },
      {
        name: 'Ring Muscle-up',
        purpose: 'Performed on gymnastic rings; requires a false grip and allows a more natural wrist path through the transition.',
        formChange: 'Use a false grip on rings. The rings rotate as you transition, which can make the movement feel smoother once the skill is learned.',
        difficulty: 'harder',
      },
      {
        name: 'Negative Muscle-up',
        purpose: 'Starts at the top (dip lockout) and lowers through the full movement; drills the transition skill under control.',
        formChange: 'Begin above the bar in the dip lockout position. Lower slowly through the transition and into a full hang.',
        difficulty: 'easier',
      },
      {
        name: 'Weighted Muscle-up',
        purpose: 'Adds external load via a weight belt; a natural progression once unweighted reps are consistent.',
        formChange: 'Attach a weight belt and perform the same movement. Requires clean technique before loading.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Do not attempt muscle-ups until you have reliable, clean pull-up and dip strength — an uncontrolled transition is a shoulder-injury risk.',
      'Elbow or shoulder pain during or after practice is a signal to reduce volume and check your technique.',
      'Build the transition skill gradually with jumping and negative variations before attempting the full movement.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // BACK
  // ════════════════════════════════════════════════════════════════════════════

  // ── Pull-ups ─────────────────────────────────────────────────────────────────
  'pull-ups': {
    exerciseKey: 'pull-ups',
    displayName: 'Pull-ups',
    summary:
      'A fundamental bodyweight pulling movement where you hang from a bar with an overhand grip ' +
      'and pull your body upward until your chin clears the bar. It trains the lats, biceps, rear ' +
      'delts, and upper back.',
    setup: [
      'Grip the bar with both hands at roughly shoulder width or slightly wider, palms facing away from you.',
      'Hang at full extension with your shoulders gently engaged — avoid a completely passive, shrugged hang.',
      'Cross your ankles or let your legs hang straight, depending on what feels most stable.',
      'Brace your core lightly to keep the body from swinging excessively.',
      'A useful starting position has your chest open and shoulder blades slightly depressed before the first pull.',
    ],
    execution: [
      'Initiate by pulling your shoulder blades down and together, then drive your elbows toward your hips.',
      'Pull your body upward until your chin clears the bar — or until your upper chest approaches it for a deeper range.',
      'Avoid kipping or swinging unless that is specifically your training goal.',
      'Lower under control to a full hang, feeling the lats lengthen at the bottom.',
      'Choose a range of motion you can control comfortably; a partial rep with control is more useful than a full rep with momentum.',
    ],
    breathing: [
      'Breathe in at the bottom hang before pulling.',
      'Exhale as you pull upward or at the top.',
      'Re-brace before each rep on heavier sets.',
      'Keep breathing steadily across higher-rep sets rather than holding the breath throughout.',
    ],
    cues: [
      '"Elbows to pockets" — driving the elbows downward and back engages the lats through the pull.',
      '"Chest to the bar" — aiming beyond chin height increases range of motion.',
      '"Controlled descent" — the lowering phase is part of the training stimulus.',
      '"Depress before you pull" — pulling the shoulder blades down before the arm pull improves lat engagement.',
    ],
    commonMistakes: [
      'Passively hanging with shrugged shoulders — engage the shoulder blades slightly before each pull.',
      'Kipping to compensate for insufficient strength — build strength with assisted pull-ups or lat pulldowns first.',
      'Pulling only to chin level when more range is available — aim for upper chest to bar where possible.',
      'Rushing the descent — a fast, uncontrolled lowering loses the eccentric training benefit.',
      'Overly wide grip — very wide grips often reduce range of motion; shoulder-width to slightly wider is a practical starting range.',
    ],
    variations: [
      {
        name: 'Assisted Pull-up (band or machine)',
        purpose: 'Reduces effective bodyweight load; useful for building strength toward unassisted pull-ups.',
        formChange: 'Loop a resistance band around the bar and under your knees or feet, or use an assisted pull-up machine.',
        difficulty: 'easier',
      },
      {
        name: 'Chin-up',
        purpose: 'Supinated (underhand) grip places relatively more emphasis on the biceps and tends to feel easier for many people.',
        formChange: 'Rotate the grip so palms face toward you. Same pulling pattern.',
        difficulty: 'easier',
      },
      {
        name: 'Neutral-grip Pull-up',
        purpose: 'Parallel-grip handles can reduce wrist and elbow stress while still training the back strongly.',
        formChange: 'Use parallel handles or a neutral-grip bar. Palms face each other throughout.',
        difficulty: 'similar',
      },
      {
        name: 'Weighted Pull-up',
        purpose: 'Adds load beyond bodyweight; a progression once unassisted reps are well-controlled.',
        formChange: 'Attach a weight plate or kettlebell via a dip belt. Same movement pattern.',
        difficulty: 'harder',
      },
      {
        name: 'Lat Pulldown',
        purpose: 'Seated cable alternative that allows precise load selection; useful as a regression or accessory.',
        formChange: 'Sit at a lat pulldown machine. Pull the bar toward the upper chest using the same elbow-drive cue.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Build pulling capacity gradually — attempting too many reps before the shoulder and elbow are conditioned can cause overuse discomfort.',
      'Elbow pain on pull-ups is a signal to reduce volume, check grip width, or temporarily use an assisted variation.',
      'Adjust grip width and hand position to what is comfortable for your shoulders and wrists.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Chin-ups ──────────────────────────────────────────────────────────────────
  'chin-ups': {
    exerciseKey: 'chin-ups',
    displayName: 'Chin-ups',
    summary:
      'A bodyweight pulling movement with a supinated (underhand) or neutral grip that trains the lats ' +
      'and biceps. The grip change compared to pull-ups places relatively more emphasis on the biceps ' +
      'and tends to feel more natural for people new to pulling movements.',
    setup: [
      'Grip the bar at roughly shoulder width with palms facing toward you.',
      'A narrower grip (closer than shoulder width) is common and generally comfortable; adjust to what feels natural.',
      'Hang at full extension with the shoulders gently engaged — not a passive, shrugged hang.',
      'Core lightly braced to reduce swinging.',
      'Cross your ankles or let your legs hang straight.',
    ],
    execution: [
      'Initiate by pulling the shoulder blades down, then drive your elbows toward your hips.',
      'Pull your body upward until your chin clears the bar, or until your upper chest approaches it.',
      'Keep your chest open and avoid tucking your chin excessively to clear the bar.',
      'Lower under control to a full hang at the bottom of each rep.',
      'Choose a range of motion you can control comfortably.',
    ],
    breathing: [
      'Breathe in at the bottom hang before pulling.',
      'Exhale as you pull upward or at the top.',
      'On higher-rep sets, breathe rhythmically once per rep.',
      'Re-brace before each rep on heavy or weighted sets.',
    ],
    cues: [
      '"Elbows to pockets" — the same lat-engagement cue as for pull-ups.',
      '"Supination helps the bicep" — the underhand grip allows the bicep to work through a stronger position.',
      '"Chest forward" — keeping the chest open avoids rounding into the top of the rep.',
      '"Full hang at the bottom" — starting each rep from a full stretch maintains consistent range of motion.',
    ],
    commonMistakes: [
      'Tucking the chin to make the bar appear cleared — aim for chin above bar by actually pulling high enough.',
      'Using momentum rather than controlled pulling — build strength with assisted variations if full reps are not yet possible.',
      'Rushing the descent — lowering quickly reduces the training stimulus from the eccentric phase.',
      'Extremely narrow grip that strains the wrist — adjust to a grip width that feels comfortable throughout.',
      'Passive shoulder hang — activate the shoulder blades before initiating each pull.',
    ],
    variations: [
      {
        name: 'Assisted Chin-up',
        purpose: 'Reduces the bodyweight load; a starting point for those working toward unassisted chin-ups.',
        formChange: 'Use a resistance band under your knees or an assisted chin-up machine.',
        difficulty: 'easier',
      },
      {
        name: 'Pull-up (overhand)',
        purpose: 'Overhand grip shifts relatively more emphasis to the lats and reduces direct bicep demand.',
        formChange: 'Rotate the grip so palms face away from you. Same pulling pattern.',
        difficulty: 'harder',
      },
      {
        name: 'Neutral-grip Chin-up',
        purpose: 'Parallel handles can reduce wrist and elbow strain for some people.',
        formChange: 'Use parallel handles so palms face each other throughout.',
        difficulty: 'similar',
      },
      {
        name: 'Weighted Chin-up',
        purpose: 'Adds load once bodyweight reps are well-controlled.',
        formChange: 'Attach a weight plate or kettlebell via a dip belt. Same movement pattern.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Elbow discomfort on chin-ups is sometimes related to supinated grip stress — trying a neutral grip is a simple first adjustment.',
      'Build volume gradually to allow the elbows and shoulder tendons to adapt.',
      'Adjust grip width and orientation to what is comfortable for your joints.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Lat Pulldown ──────────────────────────────────────────────────────────────
  'lat-pulldown': {
    exerciseKey: 'lat-pulldown',
    displayName: 'Lat Pulldown',
    summary:
      'A cable machine exercise that mimics the pull-up motion in a seated position, ' +
      'training the lats, biceps, and upper back with an adjustable load. ' +
      'A useful regression for those building toward pull-ups or as a stand-alone back exercise.',
    setup: [
      'Adjust the thigh pad so it rests firmly on your thighs — it keeps you anchored as you pull.',
      'Grip the bar at a comfortable width, typically slightly wider than shoulder width.',
      'Sit upright with a slight lean back — roughly 10–15° is common and reduces excessive lumbar stress.',
      'Pull the bar down to about face height before beginning to establish your starting position.',
      'Retract and depress your shoulder blades before the first rep.',
    ],
    execution: [
      'Pull the bar toward your upper chest by driving your elbows down and back.',
      'The bar does not need to touch your chest on every rep — aim for where you feel the lats contracting well.',
      'Avoid excessive backward lean or swinging to generate momentum; keep the torso angle consistent.',
      'Return the bar under control, allowing your arms to extend and your shoulder blades to open at the top.',
      'Do not pull the bar behind your neck — the front-of-chest path is recommended for shoulder comfort.',
    ],
    breathing: [
      'Breathe in as you let the bar rise (the return phase).',
      'Breathe out as you pull the bar down.',
      'Keep breathing steadily; avoid holding the breath across multiple consecutive reps.',
    ],
    cues: [
      '"Elbows to hips" — driving the elbows downward activates the lats through the pull.',
      '"Bar to upper chest" — a specific target helps avoid stopping too high.',
      '"Shoulders down before you pull" — depressing the shoulder blades first improves lat engagement.',
      '"Controlled return" — letting the weight stack crash loses tension and control.',
    ],
    commonMistakes: [
      'Excessive backward lean or swinging — some lean is normal but using the whole torso as a pendulum reduces back muscle engagement.',
      'Pulling behind the neck — this position can stress the cervical spine and shoulder joint; pull to the front.',
      'Stopping the pull too high — the bar should reach at least chin level for meaningful lat engagement.',
      'Letting the bar fly back up — control the return to maintain tension through the full range.',
      'Gripping too wide — very wide grips often reduce range of motion; start around shoulder width or slightly wider.',
    ],
    variations: [
      {
        name: 'Close-grip Lat Pulldown',
        purpose: 'A narrower or neutral-grip attachment changes the emphasis and can feel more comfortable for some wrists.',
        formChange: 'Use a close-grip or V-bar attachment. Elbows track closer to the body during the pull.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Lat Pulldown',
        purpose: 'Trains each side independently; useful for identifying and addressing left-right differences.',
        formChange: 'Use a single-handle attachment. Pull with one arm, keeping the torso stable.',
        difficulty: 'similar',
      },
      {
        name: 'Pull-up',
        purpose: 'The bodyweight progression; removes the weight-stack load and requires pulling your full body mass.',
        formChange: 'Hang from a bar with an overhand grip. Pull until your chin clears the bar.',
        difficulty: 'harder',
      },
      {
        name: 'Assisted Pull-up (band)',
        purpose: 'Bridges the gap between the machine and the free-hanging pull-up.',
        formChange: 'Loop a band around a bar and under your knees. Pull up against reduced effective bodyweight.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Never pull the bar behind the neck — this position is hard on the cervical spine and shoulder joint for most people.',
      'If your lower back rounds significantly during the pull, reduce load and focus on torso stability first.',
      'Adjust seat height, thigh pad, and grip width to your proportions before adding load.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Dumbbell Row ──────────────────────────────────────────────────────────────
  'dumbbell-row': {
    exerciseKey: 'dumbbell-row',
    displayName: 'Dumbbell Row',
    summary:
      'A unilateral rowing movement performed with one dumbbell at a time, training the lats, ' +
      'mid-back, rear delt, and biceps. The one-arm setup allows a long range of motion ' +
      'and can help address left-right strength differences.',
    setup: [
      'A useful starting position: place one hand and the same-side knee on a flat bench for support, with the opposite foot on the floor.',
      'The supported torso should be roughly parallel to the floor — horizontal is common, though a slight hip hike is fine.',
      'Hold the dumbbell in the free hand, arm hanging straight down below your shoulder.',
      'Keep the back in a neutral or comfortable position — avoid rounding or exaggerating the arch.',
      'Shoulder blades lightly retracted on the working side before the first pull.',
    ],
    execution: [
      'Pull the dumbbell upward by driving your elbow toward the ceiling and past your hip.',
      'Aim to bring the dumbbell close to your lower ribs or hip — the exact end point depends on your proportions.',
      'Keep the elbow relatively close to your torso rather than flaring wide.',
      'Avoid rotating the torso to lift the weight — the trunk should stay stable throughout the rep.',
      'Lower the dumbbell under control until your arm is fully extended and the lat is stretched.',
    ],
    breathing: [
      'Breathe in before the pull.',
      'Exhale as you row the dumbbell up or at the top.',
      'Re-brace between reps on heavier sets.',
      'On lighter, higher-rep sets, breathe rhythmically once per rep.',
    ],
    cues: [
      '"Elbow to the ceiling" — focusing on elbow height rather than hand position often improves lat engagement.',
      '"Dumbbell stays close" — rowing in an arc away from the body reduces lat involvement.',
      '"Stable trunk" — the torso should not twist or dip during the pull.',
      '"Full stretch at the bottom" — allowing a full arm extension between reps maintains range of motion.',
    ],
    commonMistakes: [
      'Rotating the torso to generate power — this turns the exercise into a partial twist and reduces back muscle isolation.',
      'Pulling the dumbbell too high toward the shoulder — aim for the hip or lower ribs rather than the armpit.',
      'Using momentum from the legs — keep the support knee and hand planted and pull with the back.',
      'Shortening the range of motion at the bottom — a full arm extension between reps increases stretch and engagement.',
      'Gripping too tightly — a relaxed grip lets the lat do more of the work; reduce grip fatigue by focusing the tension elsewhere.',
    ],
    variations: [
      {
        name: 'Chest-supported Dumbbell Row',
        purpose: 'Lying on an incline bench removes the need for trunk stabilisation, allowing focus on pure back activation.',
        formChange: 'Set an incline bench to 30–45°. Lie face-down on the bench. Let dumbbells hang and row them toward your hips.',
        difficulty: 'easier',
      },
      {
        name: 'Barbell Row',
        purpose: 'A bilateral barbell version; allows heavier loading and trains both sides simultaneously.',
        formChange: 'Hinge at the hips to roughly 45°, grip the barbell, and pull to the lower abdomen.',
        difficulty: 'similar',
      },
      {
        name: 'Seal Row',
        purpose: 'Torso fully supported on a high bench; eliminates hip hinge demand and reduces lower-back fatigue.',
        formChange: 'Set a bench high enough that the dumbbells hang below without touching the floor. Lie face-down and row.',
        difficulty: 'easier',
      },
      {
        name: 'Cable Row',
        purpose: 'Provides consistent tension throughout the range of motion; useful as an accessory or alternative.',
        formChange: 'Set a cable at floor height with a single handle. Hinge or sit, and row the handle toward your hip.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'If your lower back is fatigued from other exercises, a chest-supported or seated variation removes that demand.',
      'Wrist strain can occur with heavy dumbbells — use lifting straps if grip is the limiting factor rather than back strength.',
      'Adjust the torso angle and support position to what feels stable for your proportions.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── T-Bar Row ─────────────────────────────────────────────────────────────────
  't-bar-row': {
    exerciseKey: 't-bar-row',
    displayName: 'T-Bar Row',
    summary:
      'A bilateral rowing movement performed over a barbell or a dedicated T-bar machine, ' +
      'training the mid-back, lats, and rear delts with a neutral or overhand grip. ' +
      'The fixed end of the bar creates a natural arc in the load path.',
    setup: [
      'Position yourself straddling the bar with feet roughly hip-width apart.',
      'Hinge at the hips to a torso angle between 45° and roughly horizontal — your goal and comfort level determine this.',
      'Grip the handle with both hands — most setups use a V-handle for a neutral grip.',
      'Create tension before lifting: engage your core, brace the lower back into a comfortable neutral position, and retract your shoulder blades.',
      'The bar or handle should hang below your chest with arms extended before the first pull.',
    ],
    execution: [
      'Pull the handle toward your lower chest or upper abdomen, driving your elbows upward and back.',
      'At the top, squeeze the shoulder blades together briefly before lowering.',
      'Lower the handle under control until your arms are fully extended and the lats stretch.',
      'Keep the hips and torso angle stable throughout — avoid using leg drive or swinging the torso to generate momentum.',
      'Choose a range of motion you can control; reduce the load rather than compromising the torso angle.',
    ],
    breathing: [
      'Take a breath and brace before each pull.',
      'Exhale at the top of the row or just past the sticking point.',
      'Re-brace at the bottom before the next rep, especially on heavy sets.',
    ],
    cues: [
      '"Elbows up and back" — the direction of the elbow path determines back engagement.',
      '"Squeeze at the top" — a brief pause at full contraction reinforces scapular retraction.',
      '"Hips stay still" — the hinge angle should not change during the pull.',
      '"Controlled lowering" — resisting the weight on the way down is part of the training.',
    ],
    commonMistakes: [
      'Using too much torso swing — rocking generates momentum that bypasses the target muscles.',
      'Standing too upright — a steeper hinge angle generally means more mid-back engagement.',
      'Pulling to the upper chest with a very heavy load — this usually requires torso momentum; reduce load for a controlled row.',
      'Rushing the lowering phase — the eccentric under load is valuable; do not let the weight drop.',
      'Jerking from the bottom of each rep — pause or reset lightly at the bottom rather than bouncing.',
    ],
    variations: [
      {
        name: 'Chest-supported T-Bar Row',
        purpose: 'Lying on a supported pad eliminates the hip hinge demand and lower-back fatigue.',
        formChange: 'Use a T-bar machine with a chest pad. Lie face-down, and row without any trunk stabilisation requirement.',
        difficulty: 'easier',
      },
      {
        name: 'Landmine Row',
        purpose: 'Uses one end of a barbell fixed in a corner or landmine anchor; similar arc and feel to the T-bar row.',
        formChange: 'Straddle a barbell fixed at one end. Grip the sleeve or a handle attachment and row the same way.',
        difficulty: 'similar',
      },
      {
        name: 'Barbell Row',
        purpose: 'Standard bilateral barbell row with a straight-bar path rather than an arc.',
        formChange: 'Hinge at the hips, grip a barbell, and row to the lower abdomen. Both setups train similar muscle groups.',
        difficulty: 'similar',
      },
      {
        name: 'Seated Cable Row',
        purpose: 'Seated cable alternative with consistent tension; lower back demand is minimal.',
        formChange: 'Sit at a cable station, brace your torso, and pull a handle toward your lower chest.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Heavy T-bar rows with excessive torso swing can place substantial load on the lower back — prioritise control over load.',
      'If lower-back fatigue limits reps before your back muscles do, use the chest-supported variation.',
      'Adjust your hinge angle and load to your current back strength and mobility.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Seated Cable Row ──────────────────────────────────────────────────────────
  'seated-cable-row': {
    exerciseKey: 'seated-cable-row',
    displayName: 'Seated Cable Row',
    summary:
      'A seated rowing movement using a cable machine that trains the mid-back, lats, rear delts, ' +
      'and biceps with consistent tension throughout the range of motion.',
    setup: [
      'Sit at the cable row station with your feet on the foot pads, knees slightly bent.',
      'Grip the handle — a close-grip V-bar is common, but wider or single handles are also valid choices.',
      'Sit upright with a slight natural curve in the lower back rather than rigidly straight or rounded.',
      'Before the first pull, extend your arms to reach the handle and feel the cable tension stretch the shoulder blades open.',
      'Brace your core before pulling.',
    ],
    execution: [
      'Pull the handle toward your lower chest or upper abdomen by driving your elbows back.',
      'At the end of the pull, retract your shoulder blades — think of squeezing them toward your spine.',
      'Avoid leaning back excessively to finish the rep; a small amount of torso movement is normal, but the trunk should stay generally upright.',
      'Return the handle under control, allowing the shoulder blades to open and the arms to extend fully.',
      'Do not round the lower back aggressively to reach forward — a moderate reach with a controlled return is sufficient.',
    ],
    breathing: [
      'Breathe in as you reach forward and let the cable pull your arms out (the return phase).',
      'Breathe out as you pull the handle back toward your torso.',
      'Keep breathing steadily across the set.',
    ],
    cues: [
      '"Elbows past the hips" — driving the elbows rearward past the torso deepens the lat and mid-back contraction.',
      '"Squeeze the shoulder blades" — the retraction at the end of the pull is where mid-back emphasis is highest.',
      '"Tall torso" — maintaining an upright trunk keeps the rowing muscles rather than the lower back as the primary stabiliser.',
      '"Controlled reach" — the return phase should be deliberate, not a snap-forward.',
    ],
    commonMistakes: [
      'Leaning back excessively on every rep — using torso momentum shifts demand away from the back muscles.',
      'Rounding the lower back to reach far forward — a moderate stretch is fine; aggressive rounding under load is not ideal.',
      'Shrugging the shoulders during the pull — the shoulder blades should move back, not up.',
      'Letting the weight stack crash on the return — control the full negative.',
      'Stopping the pull before the elbow reaches the body — a short range of motion reduces mid-back engagement.',
    ],
    variations: [
      {
        name: 'Wide-grip Seated Cable Row',
        purpose: 'A wider bar grip changes the elbow path and tends to involve more of the upper back and rear delt.',
        formChange: 'Use a straight or wide bar attachment. Pull with elbows flaring slightly outward.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Cable Row',
        purpose: 'Unilateral pulling highlights left-right differences and allows a longer range of motion.',
        formChange: 'Use a single handle. Sit or stand and pull with one arm, keeping the torso stable.',
        difficulty: 'similar',
      },
      {
        name: 'Chest-supported Row',
        purpose: 'Lying on an incline bench eliminates trunk-stability demand and lets the back muscles work in isolation.',
        formChange: 'Set an incline bench to 30–45°. Lie face-down and row dumbbells or a cable handle.',
        difficulty: 'easier',
      },
      {
        name: 'Barbell Row',
        purpose: 'A free-weight bilateral rowing option that allows heavier loading and adds a hip-hinge stability demand.',
        formChange: 'Hinge at the hips, grip a barbell, and row to the lower abdomen.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Lower-back rounding under cable tension can accumulate stress on the lumbar discs — maintain a comfortable neutral position.',
      'Reduce the load if you find yourself relying on torso swing to complete reps.',
      'Adjust foot position and handle type to what is most comfortable for your proportions.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Face Pulls ────────────────────────────────────────────────────────────────
  'face-pulls': {
    exerciseKey: 'face-pulls',
    displayName: 'Face Pulls',
    summary:
      'A cable exercise using a rope attachment that pulls toward the face or forehead while the ' +
      'upper arms rise outward. It trains the rear delts, external rotators, and upper trapezius, ' +
      'and is often used to complement pressing-heavy programmes.',
    setup: [
      'Set the cable pulley at roughly face height or slightly above.',
      'Attach a rope handle and grip both ends with an overhand or neutral grip.',
      'Stand or take a split stance facing the cable, keeping your torso upright.',
      'Step back far enough that the cable is taut before the rep begins.',
      'Brace your core and keep a slight knee bend to avoid compensating with the lower back.',
    ],
    execution: [
      'Pull the rope toward your face or forehead, allowing your upper arms to rise outward to roughly shoulder height.',
      'As the rope reaches your face, rotate your forearms upward so your hands finish above the height of your elbows — this is the external-rotation finish.',
      'Pause briefly at the end of the pull before returning under control.',
      'Keep the torso still — avoid leaning back to complete the rep.',
      'Use a light, controlled load; face pulls are a technique-and-feel exercise more than a maximum-load exercise.',
    ],
    breathing: [
      'Breathe out as you pull the rope toward your face.',
      'Breathe in as you return the rope to the starting position.',
      'Keep breathing steadily and avoid holding your breath through the set.',
    ],
    cues: [
      '"Pull to the forehead" — a slightly high end-point encourages the external-rotation finish.',
      '"Elbows wide, hands high" — the arms should look like a goal-post shape at full pull.',
      '"Light load, full range" — the movement quality matters far more than the weight on the stack.',
      '"Torso stays still" — if the torso has to lean back, the load is too heavy.',
    ],
    commonMistakes: [
      'Leaning back to generate momentum — reduce the load and keep the torso upright.',
      'Skipping the external-rotation finish — pulling to the face without rotating the forearms up loses a key part of the movement.',
      'Setting the cable too low — a pulley below chest height changes the movement pattern significantly.',
      'Using too much weight — heavy face pulls typically become partial, momentum-driven rows.',
      'Rushing through reps — a slow, controlled pull with a deliberate pause yields better shoulder and rear-delt engagement.',
    ],
    variations: [
      {
        name: 'Band Face Pull',
        purpose: 'A resistance band alternative; useful when a cable machine is unavailable.',
        formChange: 'Anchor a band at face height. Grip both ends and perform the same pull with the external-rotation finish.',
        difficulty: 'similar',
      },
      {
        name: 'Seated Face Pull',
        purpose: 'Sitting eliminates any lower-body compensation and forces torso stability.',
        formChange: 'Sit on a bench facing the cable. Perform the same pull with no option to lean back.',
        difficulty: 'similar',
      },
      {
        name: 'High-cable Row',
        purpose: 'A horizontal cable pull without the external-rotation component; focuses more on upper back and rear delt.',
        formChange: 'Set the cable high. Pull the rope or handle toward the upper chest with elbows flaring out.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Face pulls are a low-load accessory movement — start light and build up slowly.',
      'Shoulder discomfort during the external-rotation finish is a signal to reduce range of motion or load.',
      'Adjust pulley height to achieve the natural pulling arc without straining the neck or shoulder.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Hyperextensions ───────────────────────────────────────────────────────────
  'hyperextensions': {
    exerciseKey: 'hyperextensions',
    displayName: 'Hyperextensions',
    summary:
      'A hip-hinge movement performed on a hyperextension bench that trains the glutes, ' +
      'hamstrings, and lower-back extensors through a controlled range of motion. ' +
      'Despite the name, forcefully hyperextending the lumbar spine is not required or recommended.',
    setup: [
      'Adjust the pad height so the top of the pad is just below your hip bones, allowing your hips to flex freely.',
      'Secure your feet under the ankle pads.',
      'Fold your arms across your chest, or hold them behind your head — do not pull on your neck.',
      'Start in a neutral position with your body roughly in line with your legs.',
      'Brace your core before the first rep.',
    ],
    execution: [
      'Hinge at the hips and lower your torso toward the floor under control.',
      'Descend to a comfortable depth — roughly until your torso is perpendicular to the floor, or the depth your hamstring mobility allows.',
      'Reverse the movement by squeezing your glutes and extending your hips back to the starting position.',
      'Stop when your body is in line with your legs, or just slightly past — forcing excessive lumbar extension beyond this range is not necessary.',
      'The movement is driven by the hips and glutes, not by arching the lower back hard.',
    ],
    breathing: [
      'Breathe in as you lower.',
      'Breathe out as you extend back up.',
      'Keep a light core brace throughout the set.',
    ],
    cues: [
      '"Hinge at the hip, not the waist" — the bend comes from the hip joint, keeping the spine relatively stable.',
      '"Squeeze the glutes at the top" — this reinforces the glute contribution and helps control the end range.',
      '"Slow and controlled" — a two-to-three second descent is more effective than a fast, momentum-driven rep.',
      '"Neutral spine" — the back should hold a comfortable natural curve rather than rounding or sharply arching.',
    ],
    commonMistakes: [
      'Forcing excessive lumbar extension at the top — stopping when the body is in line is sufficient.',
      'Rounding the lower back at the bottom — a comfortable neutral spine throughout is the goal.',
      'Using momentum to swing through the rep — slow down to let the glutes and hamstrings do the work.',
      'Pad placed too high — pads at the lower rib level restrict the hips from hinging freely.',
      'Pulling on the neck — hands should rest on the chest or hold a plate against the chest, not pull the head forward.',
    ],
    variations: [
      {
        name: 'Bodyweight Hyperextension',
        purpose: 'A starting point for learning the movement pattern before adding any external load.',
        formChange: 'Same setup with no added weight. Focus on controlled range of motion and glute engagement.',
        difficulty: 'easier',
      },
      {
        name: 'Weighted Hyperextension',
        purpose: 'Holding a weight plate or dumbbell at the chest adds progressive overload.',
        formChange: 'Hold a plate against your chest with crossed arms. Same movement pattern.',
        difficulty: 'harder',
      },
      {
        name: 'Romanian Deadlift',
        purpose: 'A standing hip-hinge alternative with a barbell; trains similar muscle groups with heavier loading potential.',
        formChange: 'Stand with a barbell. Hinge at the hips and lower the bar along the thighs, then extend back up.',
        difficulty: 'similar',
      },
      {
        name: 'Reduced-range Hyperextension',
        purpose: 'Limits the range of motion for those with lower-back sensitivity.',
        formChange: 'Perform the same movement but stop the descent partway rather than reaching full depth.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'If you experience lower-back pain rather than a working sensation in the glutes and hamstrings, reduce range of motion or load.',
      'Adjust the pad height carefully — a poorly positioned pad changes the mechanics of the movement significantly.',
      'The name "hyperextension" is historical; the goal is controlled hip extension, not forcing the spine into a hard arch.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Row ────────────────────────────────────────────────────────────
  'kettlebell-row': {
    exerciseKey: 'kettlebell-row',
    displayName: 'Kettlebell Row',
    summary:
      'A unilateral rowing movement using a kettlebell that trains the lats, mid-back, rear delt, ' +
      'and biceps. The mechanics are similar to the dumbbell row; the kettlebell\'s offset handle ' +
      'can feel different in the grip.',
    setup: [
      'Place one hand and the same-side knee on a bench for support, foot of the opposite leg on the floor.',
      'The supported torso should be roughly parallel to the floor.',
      'The kettlebell rests on the floor below your shoulder, handle parallel to your body.',
      'Grip the kettlebell handle firmly with the free hand, arm hanging straight down.',
      'Shoulder blades lightly retracted on the working side before beginning.',
    ],
    execution: [
      'Pull the kettlebell upward by driving your elbow toward the ceiling and past your hip.',
      'Keep the kettlebell close to your body throughout the pull — avoid letting it drift outward.',
      'Aim to bring the bell close to your lower ribs or hip.',
      'Avoid rotating the torso to complete the rep — the trunk stays stable.',
      'Lower the kettlebell under control until your arm is fully extended.',
    ],
    breathing: [
      'Breathe in before the pull.',
      'Exhale as you row the kettlebell up or at the top.',
      'Re-brace between reps on heavy sets.',
    ],
    cues: [
      '"Elbow to the ceiling" — focusing on the elbow path rather than the hand improves lat engagement.',
      '"Bell stays close" — a kettlebell that drifts outward shifts demand toward the shoulder.',
      '"Stable trunk" — no torso rotation during the pull.',
      '"Full stretch at the bottom" — a complete arm extension between reps maintains range of motion.',
    ],
    commonMistakes: [
      'Rotating the torso to lift the bell — keep the hips and shoulders square throughout.',
      'Letting the kettlebell swing away from the body — control the path close to the torso.',
      'Pulling toward the shoulder rather than the hip — aim for the hip or lower rib.',
      'Shortening the lowering phase — a full extension at the bottom maintains lat stretch and control.',
    ],
    variations: [
      {
        name: 'Dumbbell Row',
        purpose: 'A dumbbell handle can feel more stable if the kettlebell grip feels awkward at heavier loads.',
        formChange: 'Substitute a dumbbell for the kettlebell. Same supported hinge setup.',
        difficulty: 'similar',
      },
      {
        name: 'Chest-supported Kettlebell Row',
        purpose: 'Removes the trunk-stability demand so the back muscles can work in isolation.',
        formChange: 'Lie face-down on an incline bench. Row the kettlebell from a hanging arm position toward the hip.',
        difficulty: 'easier',
      },
      {
        name: 'Kettlebell Renegade Row',
        purpose: 'A more demanding plank-position row that adds significant core and anti-rotation demand.',
        formChange: 'Support yourself on two kettlebells in a plank. Row one kettlebell at a time while keeping the hips level.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'If grip fatigue limits the set before the back muscles are worked, straps are a practical option.',
      'Lower-back fatigue can accumulate with high-volume rowing; a supported setup reduces that demand.',
      'Adjust the bench support height and torso angle to your proportions.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Deadlift ───────────────────────────────────────────────────────
  'kettlebell-deadlift': {
    exerciseKey: 'kettlebell-deadlift',
    displayName: 'Kettlebell Deadlift',
    summary:
      'A hip-hinge pulling movement using a kettlebell placed between or just in front of the feet. ' +
      'It trains the posterior chain — glutes, hamstrings, lower back, and lats — using the same ' +
      'fundamental mechanics as a barbell deadlift with a lighter, accessible implement.',
    setup: [
      'Stand with the kettlebell between your feet, roughly centred under your hips.',
      'Feet roughly hip-width apart; a slight outward toe angle is common and comfortable.',
      'Hinge at the hips and bend the knees to lower your hands to the handle without rounding the lower back excessively.',
      'Grip the handle with both hands, arms inside your knees.',
      'Before lifting, create tension: push the floor away slightly, take a breath, brace your core, and feel the lats engage.',
    ],
    execution: [
      'Drive through the floor by pushing with your legs while simultaneously extending your hips upward.',
      'Keep the kettlebell close to your body — it should travel in a vertical path without drifting forward.',
      'Extend the hips and knees together until you are standing tall with glutes squeezed.',
      'At the top, do not hyperextend the lower back — a neutral, upright stance is sufficient.',
      'Lower by hinging at the hips first, then bending the knees, guiding the kettlebell back to the floor under control.',
    ],
    breathing: [
      'Take a breath in and brace before lifting the kettlebell.',
      'Hold the brace through the lift.',
      'Exhale at the top or just before lowering.',
      'Re-brace before each rep rather than breathing rapidly between reps on heavy sets.',
    ],
    cues: [
      '"Push the floor away" — a leg-drive cue encourages the legs and hips to work together rather than a back-dominant pull.',
      '"Keep the bell close" — the closer the kettlebell stays to the body, the more efficient the lift.',
      '"Squeeze at the top" — glute engagement at lockout confirms full hip extension.',
      '"Hips first on the way down" — starting the lowering with a hip hinge protects the lower back.',
    ],
    commonMistakes: [
      'Rounding the lower back excessively — a comfortable neutral spine is the goal from setup to lockout.',
      'Letting the kettlebell drift forward — this increases lower-back demand and reduces efficiency.',
      'Squatting rather than hinging — if the shins are very vertical and the torso is very upright, the lift is becoming a squat.',
      'Hyperextending at the top — standing tall with glutes engaged is enough; avoid leaning back beyond neutral.',
      'Jerking the lift off the floor — build tension before the pull, then lift smoothly.',
    ],
    variations: [
      {
        name: 'Elevated Kettlebell Deadlift',
        purpose: 'Placing the kettlebell on a box or plate reduces the range of motion; useful for those with limited hip mobility.',
        formChange: 'Elevate the kettlebell so the handle is a few inches higher than floor level. Same hinge mechanics.',
        difficulty: 'easier',
      },
      {
        name: 'Sumo Kettlebell Deadlift',
        purpose: 'A wider stance allows the torso to remain more upright and may feel more natural for some hip structures.',
        formChange: 'Widen the feet significantly and point toes outward. Grip the handle with arms between the knees.',
        difficulty: 'similar',
      },
      {
        name: 'Single-leg Kettlebell Deadlift',
        purpose: 'Challenges balance and unilateral hip-hinge mechanics with a lighter load.',
        formChange: 'Shift weight to one leg. Hinge forward as the opposite leg extends behind you. Lower the kettlebell toward the floor.',
        difficulty: 'harder',
      },
      {
        name: 'Romanian Deadlift',
        purpose: 'Emphasises the hamstring stretch by keeping the knees relatively straight throughout the hinge.',
        formChange: 'Hold the kettlebell with arms straight. Hinge at the hips with soft knees, lowering the bell along the legs.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Learn the hip hinge movement pattern with a bodyweight or very light load before adding kettlebell weight.',
      'Lower-back discomfort during or after kettlebell deadlifts is a signal to check your hinge mechanics or reduce the load.',
      'Adjust stance width, toe angle, and range of motion to your hip mobility and comfort.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Renegade Row ───────────────────────────────────────────────────
  'kettlebell-renegade-row': {
    exerciseKey: 'kettlebell-renegade-row',
    displayName: 'Kettlebell Renegade Row',
    summary:
      'A plank-based rowing movement where you support yourself on two kettlebells and row one at a ' +
      'time while maintaining a stable trunk. It trains the lats and mid-back while demanding ' +
      'significant anti-rotation core control.',
    setup: [
      'Place two kettlebells on the floor roughly shoulder-width apart, handles parallel.',
      'Set up in a push-up plank position with each hand gripping a kettlebell handle.',
      'A wider foot stance (wider than hip-width) provides a more stable base for resisting rotation.',
      'Brace your core firmly and keep your hips level before the first rep.',
      'Elevating the kettlebells on plates or starting with hexagonal dumbbells can make the setup more stable for beginners.',
    ],
    execution: [
      'While maintaining the plank position, row one kettlebell toward your hip by driving the elbow upward.',
      'The non-rowing hand stays firmly planted on its kettlebell handle.',
      'Resist the urge to rotate the hips as you row — the hips should stay square to the floor.',
      'Lower the kettlebell under control to the floor, then repeat on the other side.',
      'Alternate sides each rep, or complete a set on one side before switching.',
    ],
    breathing: [
      'Breathe out as you row the kettlebell up.',
      'Breathe in as you lower it back to the floor.',
      'The core brace should be maintained throughout; keep it tight between reps.',
    ],
    cues: [
      '"Hips stay square" — any visible hip rotation is a signal to reduce load or widen the foot stance.',
      '"Plank first, row second" — the quality of the plank determines the quality of the row.',
      '"Elbow to the ceiling" — the same lat-engagement cue as any row.',
      '"Wide feet, strong base" — a wider stance dramatically reduces how much anti-rotation work the core needs to do.',
    ],
    commonMistakes: [
      'Rotating the hips as you row — widen the feet or reduce the load if this happens.',
      'Feet too close together — a narrow stance makes anti-rotation significantly harder.',
      'Sagging hips or piked hips — the body should form a straight line from head to heels.',
      'Using too heavy a load before mastering the anti-rotation challenge — start lighter than you expect.',
      'Placing the kettlebells too wide or too narrow — roughly shoulder-width provides a practical starting position.',
    ],
    variations: [
      {
        name: 'Dumbbell Renegade Row',
        purpose: 'Using hex dumbbells creates a more stable plank base than round kettlebells.',
        formChange: 'Substitute hex dumbbells for the kettlebells. Same plank-and-row pattern.',
        difficulty: 'easier',
      },
      {
        name: 'Elevated Renegade Row',
        purpose: 'Hands on a box or bench reduce the range of motion and the balance demand.',
        formChange: 'Place kettlebells or dumbbells on a sturdy elevated surface. Plank and row from a less extreme angle.',
        difficulty: 'easier',
      },
      {
        name: 'Renegade Row with Push-up',
        purpose: 'Adds a push-up between each row; increases the pressing volume and overall fatigue.',
        formChange: 'Perform a push-up between each alternating row. The push-up also reinforces the anti-rotation demand.',
        difficulty: 'harder',
      },
      {
        name: 'Supported Kettlebell Row',
        purpose: 'A one-arm row with the opposite hand supported on a bench — a prerequisite movement for building the strength needed for renegade rows.',
        formChange: 'Place one hand and the same-side knee on a bench. Row with the free arm.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Build solid plank strength and one-arm row strength before attempting renegade rows.',
      'Wrist discomfort from gripping the kettlebell handle in a plank position is common — try hexagonal dumbbells as an alternative.',
      'Reduce load significantly before trying this for the first time; the stability demand is substantial.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Good Morning ───────────────────────────────────────────────────
  'kettlebell-good-morning': {
    exerciseKey: 'kettlebell-good-morning',
    displayName: 'Kettlebell Good Morning',
    summary:
      'A hip-hinge movement with a kettlebell held at the chest or behind the neck that trains ' +
      'the hamstrings, glutes, and spinal erectors. It places a significant demand on the posterior ' +
      'chain through a controlled hinge without loading the hands as much as a deadlift.',
    setup: [
      'Hold the kettlebell by the horns (sides of the handle) at chest level, close to the body.',
      'Alternatively, hold the bell by the horns and rest it behind the neck on the upper trapezius — start with the chest hold if this feels unfamiliar.',
      'Stand with feet roughly hip-width apart, a slight bend in the knees.',
      'Brace your core and set a comfortable neutral spine before the first rep.',
      'Begin with a very light load — this is primarily a technique-and-feel exercise.',
    ],
    execution: [
      'Push your hips back and hinge forward, allowing the torso to lower toward the floor.',
      'Maintain a comfortable spine position throughout — the back should not round significantly.',
      'Lower until you feel a stretch in the hamstrings, or until your torso is roughly parallel to the floor, whichever comes first.',
      'Reverse by driving the hips forward and extending back to standing, squeezing the glutes at the top.',
      'Choose a range of motion that respects your hamstring flexibility — do not force depth.',
    ],
    breathing: [
      'Breathe in and brace before hinging forward.',
      'Hold the brace through the hinge.',
      'Breathe out as you extend back to standing.',
      'Re-brace before each rep rather than breathing freely while hinged.',
    ],
    cues: [
      '"Push the hips back" — the hinge initiates at the hip, not by bending forward at the waist.',
      '"Soft knees throughout" — a slight knee bend prevents the hamstrings from limiting the range prematurely.',
      '"Chest up on the return" — extending the chest upward as the hips come through reinforces a strong finish.',
      '"Light load, controlled hinge" — this movement does not need heavy loading to be effective.',
    ],
    commonMistakes: [
      'Bending at the waist rather than hinging at the hip — the pelvis should tilt, not the spine fold.',
      'Rounding the lower back under load — if rounding occurs, reduce range of motion or load.',
      'Locking the knees completely — a small knee bend allows the hamstrings to lengthen comfortably.',
      'Using too much weight — good mornings train the pattern; excessive load encourages form breakdown.',
      'Holding the bell in an unstable position behind the neck — build comfort with the chest-hold variation first.',
    ],
    variations: [
      {
        name: 'Bodyweight Good Morning',
        purpose: 'A load-free option to learn and groove the hip-hinge pattern.',
        formChange: 'Cross your arms over your chest or rest your hands behind your head. Same hip-hinge movement with no added load.',
        difficulty: 'easier',
      },
      {
        name: 'Banded Good Morning',
        purpose: 'A resistance band looped behind the neck and under the feet provides gentle, accommodating resistance.',
        formChange: 'Step on the band and loop it over the upper back. Hinge forward against the band tension.',
        difficulty: 'similar',
      },
      {
        name: 'Romanian Deadlift',
        purpose: 'A similar hip-hinge pattern with the load in the hands rather than on the back; allows heavier loading.',
        formChange: 'Hold a kettlebell or barbell at arms length. Hinge at the hips with soft knees and lower along the thighs.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'The good morning places load on the spine in a hinged position — keep loads conservative and technique sound.',
      'Lower-back discomfort during the movement is a signal to reduce range of motion or load, or to return to the bodyweight version.',
      'The behind-the-neck hold can be uncomfortable for some — the chest hold is equally effective and more accessible.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Typewriter Pull-ups ───────────────────────────────────────────────────────
  'typewriter-pull-ups': {
    exerciseKey: 'typewriter-pull-ups',
    displayName: 'Typewriter Pull-ups',
    summary:
      'An advanced pull-up variation where, at the top of the movement, the body shifts laterally ' +
      'from side to side along the bar — mimicking the motion of a typewriter carriage. ' +
      'Requires significant pulling strength and shoulder stability.',
    setup: [
      'Grip the bar wider than shoulder width — a wide grip provides room for the lateral travel.',
      'Hang at full extension with shoulder blades lightly engaged.',
      'Brace your core; the body should stay relatively straight throughout the lateral travel.',
      'Build a foundation of consistent, strong pull-ups and ideally some archer pull-up exposure before attempting this variation.',
    ],
    execution: [
      'Pull yourself up until your chest is at or above bar height — higher than a standard chin-up.',
      'Once at the top, shift your body laterally toward one hand, keeping your chest near bar level.',
      'Extend the arm on the side you moved away from — the opposite arm remains bent, pulling you toward it.',
      'Travel as far as your shoulder and strength allow, then shift back to centre or to the other side.',
      'Lower under control once the lateral movement is complete.',
    ],
    breathing: [
      'Breathe in before the initial pull.',
      'Breathe during the lateral travel phase where possible.',
      'Exhale on the way down or when you reach the centre position.',
      'Do not hold your breath across the full movement.',
    ],
    cues: [
      '"Pull high first" — getting your chest near bar level is the prerequisite for lateral travel.',
      '"One arm bends, one arm extends" — the lateral shift is driven by differential elbow angles.',
      '"Slow the travel" — the lateral phase should be controlled, not a swing.',
      '"Stable trunk" — the core should remain braced throughout to prevent hip sway.',
    ],
    commonMistakes: [
      'Attempting without sufficient pull-up strength — if you cannot do 5–8 clean, controlled pull-ups, this variation is premature.',
      'Not pulling high enough before shifting — lateral travel is only possible when the chest is at or near bar height.',
      'Swinging the hips during lateral travel — the movement should come from the arms and shoulders, not a body swing.',
      'Grip too narrow — a shoulder-width or narrower grip leaves no room for lateral movement.',
      'Forcing range of motion the shoulder is not ready for — build the movement gradually.',
    ],
    variations: [
      {
        name: 'Archer Pull-up',
        purpose: 'A prerequisite and regression; one arm bends while the other extends, but without the lateral travel.',
        formChange: 'Start wide. Pull toward one hand while extending the other arm. Descend. Alternate sides each rep.',
        difficulty: 'easier',
      },
      {
        name: 'Assisted Typewriter Pull-up (band)',
        purpose: 'Reduces the bodyweight load so the lateral phase can be practised with less strength demand.',
        formChange: 'Loop a band under your knees. Perform the same high pull and lateral travel against reduced bodyweight.',
        difficulty: 'easier',
      },
      {
        name: 'Weighted Pull-up',
        purpose: 'Builds the raw pulling strength that typewriter pull-ups require.',
        formChange: 'Perform standard pull-ups with a weight belt. Same grip and pull pattern without the lateral phase.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Typewriter pull-ups place substantial demand on the shoulder joint through the lateral travel — build a strong pull-up foundation first.',
      'Shoulder discomfort during the extended-arm phase is a signal to reduce the range of lateral travel.',
      'Use a wider grip and start with a small lateral shift, increasing range gradually over time.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Australian Pull-ups ───────────────────────────────────────────────────────
  'australian-pull-ups': {
    exerciseKey: 'australian-pull-ups',
    displayName: 'Australian Pull-ups',
    summary:
      'A bodyweight horizontal rowing movement performed under a low bar or suspension rings, ' +
      'also known as an inverted row. The body stays roughly horizontal while you pull your chest ' +
      'toward the bar — an effective and accessible stepping stone toward full pull-ups.',
    setup: [
      'Set a bar at waist to chest height, or use a smith machine bar, rings, or TRX set at an appropriate height.',
      'Grip the bar with both hands at roughly shoulder width, palms facing away (overhand) or toward you (underhand).',
      'Walk your feet under the bar until your body is at an angle — the closer to horizontal you are, the harder the movement.',
      'Keep your body in a straight line from head to heels; engage your core and glutes.',
      'Hang with your arms fully extended before the first rep.',
    ],
    execution: [
      'Pull your chest toward the bar by driving your elbows back.',
      'At the top, your chest should touch or nearly touch the bar.',
      'Keep your body in a straight line throughout — do not let the hips sag or pike.',
      'Lower under control to full arm extension.',
      'Choose a body angle you can complete with good control; steeper (feet closer to under the bar) is harder, shallower (feet further out) is easier.',
    ],
    breathing: [
      'Breathe in before pulling.',
      'Exhale as you pull your chest to the bar or at the top.',
      'Keep breathing steadily across the set.',
    ],
    cues: [
      '"Chest to the bar" — the target is the upper chest meeting the bar, not just raising the chin.',
      '"Plank of steel" — the body should move as a rigid unit, not folding at the hips.',
      '"Elbows back" — the elbow path drives back-muscle engagement.',
      '"Walk feet in to progress" — moving the feet closer to directly under the bar increases the effective bodyweight load.',
    ],
    commonMistakes: [
      'Hips sagging during the pull — brace the glutes and core to maintain a straight body line.',
      'Stopping short of full arm extension at the bottom — lower fully between reps for complete range of motion.',
      'Pulling with only the arms rather than the back — think about driving the elbows back and squeezing the shoulder blades.',
      'Body angle too shallow (easy) without progressing — gradually move the feet closer to the bar as strength improves.',
      'Overhand grip causing forearm strain — try a neutral or underhand grip if the overhand position feels uncomfortable.',
    ],
    variations: [
      {
        name: 'Feet-elevated Australian Pull-up',
        purpose: 'Raising the feet on a bench brings the body closer to horizontal, increasing the effective load.',
        formChange: 'Rest your feet on a bench or box so the body is roughly parallel to the floor.',
        difficulty: 'harder',
      },
      {
        name: 'Assisted Australian Pull-up (feet on floor, angled)',
        purpose: 'A shallow angle reduces the effective load; ideal for beginners building pulling strength.',
        formChange: 'Set the bar higher so your body is at a steep angle (closer to standing). More of your bodyweight is supported.',
        difficulty: 'easier',
      },
      {
        name: 'Ring Inverted Row',
        purpose: 'Gymnastic rings allow the grip to rotate naturally through the movement and increase instability.',
        formChange: 'Set rings at the same height as the bar. Grip each ring and perform the same horizontal pull.',
        difficulty: 'similar',
      },
      {
        name: 'Pull-up',
        purpose: 'The vertical progression; Australian pull-ups are one of the best preparations for full pull-ups.',
        formChange: 'Hang from a bar above your head with an overhand grip. Pull your chin over the bar.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Ensure the bar or surface you use is stable and can support your full bodyweight before beginning.',
      'Shoulder discomfort during the pull is a signal to adjust grip width or body angle.',
      'Progress the foot position gradually — moving from a shallow angle to near-horizontal is a significant strength jump.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // SHOULDERS
  // ════════════════════════════════════════════════════════════════════════════

  // ── Overhead Press ────────────────────────────────────────────────────────────
  'overhead-press': {
    exerciseKey: 'overhead-press',
    displayName: 'Overhead Press',
    summary:
      'A standing barbell pressing movement where the bar travels from shoulder height to full ' +
      'overhead extension. It trains the front and lateral deltoids, triceps, and upper traps, ' +
      'and requires the whole body to work as a stable base.',
    setup: [
      'Grip the bar just outside shoulder width with wrists stacked over your forearms — avoid letting the wrists bend back excessively.',
      'Unrack with the bar resting on your front deltoids or upper chest, elbows slightly in front of the bar.',
      'Stand with feet roughly hip-width apart, a natural knee bend, and your core braced.',
      'Squeeze the glutes and brace the trunk before pressing — this prevents the lower back from arching excessively.',
      'A slight lean back as the bar passes the forehead is normal; it is not the same as collapsing the lower back.',
    ],
    execution: [
      'Press the bar in a vertical or very slightly arcing path, moving the head back briefly as the bar clears the forehead.',
      'As the bar passes your head, bring your body back under the bar rather than pressing forward.',
      'Lock out overhead with the bar above your wrists, elbows, and shoulders — ears visible in front of your upper arms is a useful check.',
      'Lower under control, allowing the bar to return to the front delt position.',
      'Reset the brace before each rep on heavier sets.',
    ],
    breathing: [
      'Breathe in and brace before pressing.',
      'Exhale at the top or just past the sticking point.',
      'Re-brace at the starting position between heavy reps.',
      'On lighter sets, breathe rhythmically once per rep.',
    ],
    cues: [
      '"Armpits forward" — rotating the elbows slightly forward before pressing helps engage the press more efficiently.',
      '"Bar over the mid-foot" — the bar path should stay over your centre of balance.',
      '"Squeeze the glutes" — lower-body tension creates a stable base and limits excessive lower-back extension.',
      '"Lockout tall" — fully extend and shrug slightly at the top to engage the upper traps in a stable overhead position.',
    ],
    commonMistakes: [
      'Pressing the bar forward rather than vertically — the bar should travel straight up, not away from the body.',
      'Excessive lower-back arch — brace the trunk and glutes rather than leaning back to get the bar overhead.',
      'Flaring the elbows wide before pressing — a moderate elbow angle (slightly in front of the bar) is more efficient.',
      'Stopping short of full lockout — a partial press at the top leaves the upper traps under-utilised.',
      'Rushing the descent — a controlled lowering phase maintains tension and positions the bar correctly for the next rep.',
    ],
    variations: [
      {
        name: 'Seated Barbell Overhead Press',
        purpose: 'Seated eliminates leg-drive assistance and requires the upper body to do more of the work.',
        formChange: 'Sit on an upright bench with the bar in a rack at shoulder height. Press the same vertical path.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Shoulder Press',
        purpose: 'Each arm moves independently; useful for addressing left-right differences and allows more natural wrist rotation.',
        formChange: 'Hold dumbbells at shoulder height. Press overhead from a seated or standing position.',
        difficulty: 'similar',
      },
      {
        name: 'Push Press',
        purpose: 'Uses a brief leg drive to overcome the sticking point; allows heavier loads than a strict press.',
        formChange: 'Dip the knees slightly and drive the legs to initiate the bar path, then press to lockout.',
        difficulty: 'easier',
      },
      {
        name: 'Landmine Press',
        purpose: 'An angled press from chest to overhead that is often more comfortable for the shoulder joint.',
        formChange: 'Fix one end of a barbell in a corner or landmine. Press the free end upward at an angle from shoulder height.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Use a rack with safeties at the correct height — failing on the overhead press with no support is awkward to bail from.',
      'Shoulder discomfort at the bottom of the press (when the bar is at the front delt) can sometimes be reduced by widening the grip slightly or adjusting elbow angle.',
      'Do not force the shoulder into a position that feels unstable or painful — a reduced range of motion is preferable.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Military Press ────────────────────────────────────────────────────────────
  'military-press': {
    exerciseKey: 'military-press',
    displayName: 'Military Press',
    summary:
      'A strict standing barbell overhead press performed with feet together and no leg drive. ' +
      'The constrained stance and absence of lower-body assistance places greater demand on the ' +
      'shoulders and trunk than a standard overhead press with a wider base.',
    setup: [
      'Stand with feet together or very close — this narrower base is what distinguishes a military press from a standard overhead press.',
      'Grip the bar just outside shoulder width, wrists stacked over forearms.',
      'Unrack with the bar on your front deltoids, elbows slightly in front.',
      'Brace the trunk and glutes firmly — the narrow stance means less natural stability, so the core must work harder.',
      'No knee bend or dip before the press — this movement does not use leg drive.',
    ],
    execution: [
      'Press the bar vertically, moving the head back briefly as the bar clears the forehead.',
      'Drive to full lockout overhead — ears visible in front of upper arms at the top.',
      'Lower under control to the front delt position.',
      'Maintain the narrow foot position throughout — if you find yourself widening the stance, you are compensating.',
      'If a truly strict press with feet together is not available to you, a shoulder-width stance with deliberate no-dip discipline is a practical alternative.',
    ],
    breathing: [
      'Breathe in and brace before pressing.',
      'Exhale at the top or past the sticking point.',
      'Re-brace between reps, especially on heavier sets.',
    ],
    cues: [
      '"Feet together, trunk on" — the combination of the narrow base and a braced trunk is what makes this a military press.',
      '"No dip" — any knee bend before the press makes it a push press; keep the legs straight.',
      '"Vertical bar path" — the bar should travel straight up, not forward.',
      '"Control the descent" — the lowering phase matters; do not let the bar drop.',
    ],
    commonMistakes: [
      'Dipping the knees before pressing — this turns the lift into a push press; keep the legs locked throughout.',
      'Widening the feet during the set — the narrow stance should be maintained for the whole set.',
      'Pressing the bar forward — the bar should stay over the mid-foot and travel vertically.',
      'Arching the lower back excessively — trunk bracing is more important here than with a wider-stance press.',
      'Confusing the military press with a push press — they are distinct; the military press uses no leg assistance.',
    ],
    variations: [
      {
        name: 'Overhead Press (standard)',
        purpose: 'A shoulder-width or hip-width stance makes the press less demanding on trunk stability; a practical starting point.',
        formChange: 'Widen the feet to shoulder or hip width. The pressing mechanics are otherwise identical.',
        difficulty: 'easier',
      },
      {
        name: 'Seated Military Press',
        purpose: 'Sitting eliminates the balance challenge of the narrow stance while preserving the strict, no-leg-drive character.',
        formChange: 'Sit upright on a bench with no back support. Feet together. Press with no lean-back or torso momentum.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Shoulder Press',
        purpose: 'Independent arm movement; a useful alternative when barbell access is limited.',
        formChange: 'Hold dumbbells at shoulder height. Press overhead seated or standing.',
        difficulty: 'easier',
      },
      {
        name: 'Push Press',
        purpose: 'Leg drive assists the bar past the sticking point; not a military press, but a progression for heavier loads.',
        formChange: 'Add a brief knee dip before the press. Wider foot stance is permitted.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'The narrow stance reduces stability — start with a lighter load than your standard overhead press until you are comfortable with the balance demand.',
      'If the narrow stance causes lower-back discomfort, a slightly wider stance with strict no-leg-drive discipline achieves a similar stimulus.',
      'Do not force overhead range if shoulder mobility is limited — use a range that feels stable and controlled.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Dumbbell Shoulder Press ───────────────────────────────────────────────────
  'dumbbell-shoulder-press': {
    exerciseKey: 'dumbbell-shoulder-press',
    displayName: 'Dumbbell Shoulder Press',
    summary:
      'A pressing movement where each arm moves independently, training the front and lateral ' +
      'deltoids and triceps. The independent arm movement can reduce left-right imbalances and ' +
      'allows a more natural wrist path than a barbell.',
    setup: [
      'Sit on an upright bench with back support, or stand — both are valid choices with slightly different stability demands.',
      'Hold a dumbbell in each hand at shoulder height, palms facing forward or angled inward (neutral grip).',
      'Sit tall with a natural lower-back curve — avoid flattening the back against the pad by craning forward.',
      'Brace your core before pressing.',
      'A useful starting position has the dumbbells at ear height, elbows roughly at 90°.',
    ],
    execution: [
      'Press both dumbbells upward, allowing the wrists to rotate slightly if using a neutral starting grip.',
      'Stop just short of the dumbbells touching at the top to maintain tension on the muscles.',
      'Lower under control to the starting position — the elbows should not drop below the bench line.',
      'Avoid an exaggerated lower-back arch to get extra range — use a range of motion your shoulders can control comfortably.',
      'Choose a range of motion that feels stable for your shoulder joint; the elbows should track in a comfortable plane.',
    ],
    breathing: [
      'Breathe in before lowering the dumbbells.',
      'Exhale as you press overhead.',
      'On lighter sets, breathe once per rep.',
      'Re-brace between heavy reps.',
    ],
    cues: [
      '"Even pressure through both hands" — helps identify and address any side-to-side differences.',
      '"Stop short of touching" — maintains tension through the set.',
      '"Wrists over elbows" — keeping the wrist stacked over the elbow throughout the press protects the joint.',
      '"Tall posture" — pressing with a slumped back reduces the stability of the shoulder position.',
    ],
    commonMistakes: [
      'Letting the dumbbells drift too far forward or backward at the top — the wrist should stay stacked over the elbow.',
      'Excessive lower-back arch — indicates the load is too heavy or the seated position needs adjustment.',
      'Touching the dumbbells at the top — allows brief muscle relaxation; stopping just short keeps tension more consistent.',
      'Dropping the elbows below a comfortable plane — the shoulder has limits to its comfortable range at the bottom.',
      'One side leading the other significantly — indicates a strength asymmetry worth monitoring.',
    ],
    variations: [
      {
        name: 'Neutral-grip Dumbbell Press',
        purpose: 'Palms facing each other throughout can reduce shoulder-joint stress for some people.',
        formChange: 'Start and finish with palms facing inward (hammer grip). Press in the same arc.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Dumbbell Press',
        purpose: 'Trains one side at a time; increases core anti-rotation demand.',
        formChange: 'Press with one arm only, keeping the opposite hand on your thigh or core. Press and lower on one side.',
        difficulty: 'similar',
      },
      {
        name: 'Overhead Barbell Press',
        purpose: 'A bilateral barbell alternative; heavier loading potential with a fixed bar path.',
        formChange: 'Use a barbell on a rack. Both hands share the bar. Press vertically from the front delts.',
        difficulty: 'similar',
      },
      {
        name: 'Arnold Press',
        purpose: 'Adds a rotation component from a neutral starting grip to a pronated finish; involves more of the shoulder through the movement.',
        formChange: 'Begin with palms facing your face. Rotate the wrists outward as you press to finish palms-forward at the top.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'If your shoulder clicks or catches at the bottom of the range, reduce depth or try a neutral grip.',
      'Avoid forcing the elbow below a comfortable level at the start of each rep.',
      'Do not force a shoulder position that feels unstable or painful — adjust load or range first.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Arnold Press ──────────────────────────────────────────────────────────────
  'arnold-press': {
    exerciseKey: 'arnold-press',
    displayName: 'Arnold Press',
    summary:
      'A dumbbell shoulder press variation that begins with palms facing inward and rotates ' +
      'to a pronated finish as the dumbbells are pressed overhead. The rotation involves the ' +
      'shoulder through a longer arc than a standard press.',
    setup: [
      'Sit upright on a bench with back support, or stand.',
      'Hold both dumbbells at shoulder height with palms facing toward your face — the starting position differs from a standard press.',
      'Elbows are roughly at shoulder height, pointed forward or slightly downward at the start.',
      'Brace your core before pressing.',
      'Start with a lighter load than your standard dumbbell press — the rotation adds a control demand.',
    ],
    execution: [
      'As you press the dumbbells upward, simultaneously rotate your wrists so the palms face forward by the time the arms are fully extended.',
      'The rotation should feel smooth and controlled, not forced — the wrists should reach the pronated position naturally as the arms extend.',
      'Stop just short of the dumbbells touching at the top.',
      'Reverse the movement on the way down: rotate the wrists back to palms-facing-inward as you lower to the start.',
      'Choose a range of motion you can control; do not force the shoulder into a position that feels unstable.',
    ],
    breathing: [
      'Breathe in before pressing.',
      'Exhale as you press and rotate to the top.',
      'Breathe in on the way down.',
    ],
    cues: [
      '"Rotate as you rise" — the wrist rotation and the press happen simultaneously, not sequentially.',
      '"Control the rotation" — the reverse rotation on the way down is as important as the press itself.',
      '"Light load, full arc" — the value of the Arnold press is the range, not the maximum weight.',
      '"Shoulders stay down" — avoid shrugging as you reach the top.',
    ],
    commonMistakes: [
      'Forcing the rotation faster than the press allows — the two should happen together at the same pace.',
      'Using too heavy a load — the rotation adds complexity; reduce the weight relative to your standard press.',
      'Starting with palms facing forward (same as a standard press) — the defining feature of the Arnold press is the palms-inward starting position.',
      'Shrugging at the top — keep the shoulder blades depressed through the full press.',
      'Losing control during the descent rotation — the lowering phase should mirror the pressing phase.',
    ],
    variations: [
      {
        name: 'Dumbbell Shoulder Press',
        purpose: 'A standard press without the rotation; useful as a regression or to compare the two movement patterns.',
        formChange: 'Keep palms facing forward throughout — no rotation. Press and lower with a fixed grip.',
        difficulty: 'easier',
      },
      {
        name: 'Single-arm Arnold Press',
        purpose: 'One side at a time; allows more focus on the rotation quality of each arm.',
        formChange: 'Perform with one dumbbell. Keep the opposite hand on your thigh for balance.',
        difficulty: 'similar',
      },
      {
        name: 'Landmine Press',
        purpose: 'A fixed-arc overhead press that is often more comfortable for the shoulder joint.',
        formChange: 'Fix a barbell end in a landmine or corner. Press the free end from shoulder height to full extension at an angle.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'The rotation through the shoulder joint is the distinguishing feature of this exercise — do not force it if it feels uncomfortable.',
      'Front-shoulder or rotator-cuff discomfort during the rotation is a signal to reduce load or range of motion.',
      'Start lighter than you expect and build up gradually with this variation.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Lateral Raises ────────────────────────────────────────────────────────────
  'lateral-raises': {
    exerciseKey: 'lateral-raises',
    displayName: 'Lateral Raises',
    summary:
      'A shoulder isolation exercise where the arms are raised outward to roughly shoulder height ' +
      'with dumbbells or cables. It places relatively more emphasis on the lateral deltoid.',
    setup: [
      'Stand or sit with a dumbbell in each hand, palms facing inward at your sides.',
      'A slight bend in the elbow is useful throughout — it reduces stress on the elbow joint.',
      'Stand tall with a natural posture; avoid pre-leaning to one side.',
      'Keep the shoulders depressed — not shrugged — before beginning.',
      'Use a light-to-moderate load; the lateral raise is a detail movement where control matters more than load.',
    ],
    execution: [
      'Raise both arms outward to the sides until they are roughly level with your shoulders.',
      'Lead with your elbows rather than your hands — the wrists can be slightly lower than the elbows throughout.',
      'Pause briefly at the top before lowering under control.',
      'Lower slowly — a two-to-three second descent is more effective than a fast drop.',
      'Choose a range of motion you can control without shrugging or swinging; stopping just below shoulder height is fine if that is your comfortable range.',
    ],
    breathing: [
      'Breathe out as you raise the arms.',
      'Breathe in as you lower them.',
      'Keep breathing steadily; avoid holding your breath across multiple reps.',
    ],
    cues: [
      '"Pour a jug" — tilting the pinky side of the hand slightly upward (as if pouring) can increase lateral delt engagement for some people.',
      '"Lead with the elbow" — the elbow travels slightly above the wrist throughout the arc.',
      '"Shoulders stay down" — shrugging during the raise shifts demand to the upper traps rather than the lateral delt.',
      '"Slow the descent" — the lowering phase is where much of the training stimulus occurs.',
    ],
    commonMistakes: [
      'Using too much weight — heavy lateral raises almost always involve shrugging, swinging, or a shortened range of motion.',
      'Shrugging to raise the arms — the shoulders should stay depressed as the arms rise.',
      'Raising above shoulder height — there is limited additional lateral delt benefit above parallel, and the upper traps take over.',
      'Swinging the torso — momentum from the trunk removes the challenge from the shoulder.',
      'Fully straightening the elbows — a slight bend is a practical starting point for reducing elbow stress.',
    ],
    variations: [
      {
        name: 'Cable Lateral Raise',
        purpose: 'Cables maintain tension at the bottom of the arc (where dumbbells have minimal tension), providing a different stimulus.',
        formChange: 'Set the cable at the lowest position. Stand beside the cable and raise the arm to shoulder height.',
        difficulty: 'similar',
      },
      {
        name: 'Leaning Lateral Raise',
        purpose: 'Holding a fixed point and leaning away from it increases the range of motion at the bottom.',
        formChange: 'Hold a rack or pole with one hand. Lean slightly away and raise the opposite arm with a dumbbell.',
        difficulty: 'similar',
      },
      {
        name: 'Seated Lateral Raise',
        purpose: 'Seated position removes any possibility of using a leg push or torso swing for momentum.',
        formChange: 'Sit on the edge of a bench. Perform the same arm raise with strict torso position.',
        difficulty: 'similar',
      },
      {
        name: 'Band Lateral Raise',
        purpose: 'A resistance band alternative; tension increases through the range of motion.',
        formChange: 'Step on a resistance band with both feet. Hold the band in each hand at the sides. Raise to shoulder height.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Start with a weight that lets you complete reps with a controlled arc and no shrugging — it will likely feel lighter than expected.',
      'Shoulder impingement symptoms (pinching at the top of the arc) may be reduced by slightly tilting the pinky up or reducing range of motion.',
      'Do not force the shoulder into a position that feels unstable or painful.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Front Raises ──────────────────────────────────────────────────────────────
  'front-raises': {
    exerciseKey: 'front-raises',
    displayName: 'Front Raises',
    summary:
      'A shoulder exercise where the arms are raised forward to roughly shoulder height, training ' +
      'the front deltoid. The front delt is also heavily involved in most pressing movements, ' +
      'so front raises are often used as an accessory rather than a primary exercise.',
    setup: [
      'Stand with a dumbbell, plate, or cable handle in each hand (or one held with both hands for a plate).',
      'Palms facing down or angled inward — choose what feels natural for your wrist.',
      'Stand tall with a natural posture and core lightly braced.',
      'Keep the elbows slightly bent throughout — a locked straight arm is not required.',
      'A light load is appropriate; front raises are a supplemental movement for most training goals.',
    ],
    execution: [
      'Raise both arms forward to roughly shoulder height — parallel to the floor is a common stopping point.',
      'Keep the movement controlled and deliberate; avoid using the trunk to swing the weight up.',
      'Pause briefly at the top, then lower under control.',
      'You do not need to raise above shoulder height — extra elevation recruits more upper trap and does not significantly add front delt work.',
      'Choose a range of motion you can control comfortably with minimal torso lean.',
    ],
    breathing: [
      'Breathe out as you raise the arms.',
      'Breathe in as you lower them.',
      'Keep breathing steadily throughout the set.',
    ],
    cues: [
      '"Raise to parallel" — stopping at shoulder height is a clear, practical target.',
      '"Torso stays tall" — any trunk lean to assist the raise is momentum, not muscle.',
      '"Controlled descent" — lowering slowly is as valuable as raising deliberately.',
      '"Elbows slightly soft" — a gentle bend reduces joint stress at the endpoint.',
    ],
    commonMistakes: [
      'Swinging the torso back to generate momentum — reduces the demand on the front delt significantly.',
      'Raising the arms well above shoulder height — adds little benefit and tends to involve the upper trap heavily.',
      'Using too much weight — the front delt is a relatively small muscle; loads that require momentum are counterproductive.',
      'Raising both arms simultaneously when the weight is too heavy — alternating arms allows better control per rep.',
      'Ignoring the descent — the lowering phase provides training benefit; do not let the arms drop quickly.',
    ],
    variations: [
      {
        name: 'Plate Front Raise',
        purpose: 'Holding a plate with both hands provides a stable, symmetrical load and natural grip.',
        formChange: 'Hold a weight plate with both hands at the sides (like a steering wheel). Raise forward to shoulder height.',
        difficulty: 'similar',
      },
      {
        name: 'Alternating Dumbbell Front Raise',
        purpose: 'One arm at a time allows better control and a brief rest between sides.',
        formChange: 'Raise one arm at a time while the opposite arm rests at the side. Alternate each rep.',
        difficulty: 'easier',
      },
      {
        name: 'Cable Front Raise',
        purpose: 'Provides constant tension through the range of motion, unlike dumbbells which have minimal tension at the bottom.',
        formChange: 'Set a cable at floor level. Face away from the machine and raise the handle from hip to shoulder height.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Front raises may feel redundant if your programme already includes significant overhead and chest pressing; consider whether they add meaningful volume for your goals.',
      'Shoulder pain at the top of the range can often be addressed by stopping just below shoulder height.',
      'Do not force the shoulder into a position that feels unstable or painful — adjust range or load first.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Rear Delt Fly ─────────────────────────────────────────────────────────────
  'rear-delt-fly': {
    exerciseKey: 'rear-delt-fly',
    displayName: 'Rear Delt Fly',
    summary:
      'A pulling movement that trains the rear deltoid, lower traps, and rhomboids through a ' +
      'horizontal arc. It is often performed in a hinged or supported position to reduce lower-back ' +
      'demand and isolate the rear shoulder.',
    setup: [
      'A useful starting position: hinge forward at the hips until your torso is close to parallel with the floor.',
      'Hold a dumbbell in each hand, arms hanging straight below your shoulders, palms facing each other.',
      'A slight bend in the elbows is useful — maintain this angle throughout.',
      'Keep the spine in a comfortable neutral position; avoid rounding the back to reach the floor.',
      'Alternatively, lie face-down on an incline bench for a fully supported setup.',
    ],
    execution: [
      'Raise both arms outward and upward in a wide arc, leading with your elbows.',
      'Aim to bring your arms roughly to the level of your torso — parallel to the floor is a useful target.',
      'At the top, squeeze the rear delts and retract the shoulder blades briefly.',
      'Lower under control, allowing the arms to return to hanging below the shoulders.',
      'The movement is a fly, not a row — avoid bending the elbows more throughout the lift.',
    ],
    breathing: [
      'Breathe out as you raise the arms.',
      'Breathe in as you lower them.',
      'Keep breathing steadily; the hinged position can make breathing feel more effortful.',
    ],
    cues: [
      '"Lead with the elbows" — this keeps the rear delt as the primary mover.',
      '"Squeeze at the top" — a brief hold at the top reinforces rear delt engagement.',
      '"Thumbs slightly up" — rotating the thumb up as the arm rises can increase rear delt involvement for some people.',
      '"Fly, not row" — the elbows should not bend more during the lift.',
    ],
    commonMistakes: [
      'Bending the elbows progressively during the lift — this turns the movement into a row and reduces rear delt isolation.',
      'Using too much weight — heavy rear delt flies almost always involve trunk swinging or arm pulling.',
      'Not reaching parallel — a range of motion that stops well short of horizontal loses the peak contraction at the top.',
      'Shrugging at the top — the trapezius taking over is common with too much weight or if the arm position is too high.',
      'Raising the arms too high (above horizontal) — shifts demand to the upper traps significantly.',
    ],
    variations: [
      {
        name: 'Incline Bench Rear Delt Fly',
        purpose: 'Lying face-down on an incline bench removes lower-back demand and allows full focus on the rear delt.',
        formChange: 'Set a bench to 30–45°. Lie face-down and perform the same wide arc with arms hanging below.',
        difficulty: 'easier',
      },
      {
        name: 'Cable Rear Delt Fly',
        purpose: 'Cables maintain tension throughout the arc; set the pulleys high and cross the cables for a horizontal pull.',
        formChange: 'Set both pulleys at face height. Stand in the centre, cross your hands, and pull the handles apart in a wide arc.',
        difficulty: 'similar',
      },
      {
        name: 'Reverse Pec Deck',
        purpose: 'A machine guides the arc and allows a heavier load with consistent resistance.',
        formChange: 'Sit facing the pec deck pad. Grip the handles and move the arms apart in the reverse fly arc.',
        difficulty: 'similar',
      },
      {
        name: 'Face Pulls',
        purpose: 'Adds an external-rotation finish to a similar cable pulling pattern; trains the rear delt and rotator cuff together.',
        formChange: 'Set a cable at face height with a rope. Pull the rope toward your face while rotating the forearms upward.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'The hinged position places load on the lower back — use a supported setup if lower-back fatigue is a concern.',
      'Keep the load light enough that the movement quality is high throughout all reps.',
      'Do not force the shoulder into a position that feels unstable or painful.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Upright Row ───────────────────────────────────────────────────────────────
  'upright-row': {
    exerciseKey: 'upright-row',
    displayName: 'Upright Row',
    summary:
      'A pulling movement where the bar or dumbbells are drawn upward along the torso, training the ' +
      'lateral deltoids and upper trapezius. The grip width and how high you pull can be adjusted ' +
      'to find a range of motion that is comfortable for your shoulders.',
    setup: [
      'Hold a barbell, dumbbells, or cable handle in front of your body, arms extended.',
      'Grip width affects comfort — a wider grip tends to feel more comfortable for the shoulder for many people; a close grip places the elbows in a more internally rotated position.',
      'Stand with feet hip-width apart and a comfortable posture.',
      'Let the bar or dumbbells rest at hip level before starting.',
    ],
    execution: [
      'Pull the weight upward by driving your elbows upward and outward.',
      'Raise only through a range of motion that feels comfortable — the elbows do not need to reach a fixed height.',
      'Many people find that stopping when the weight is roughly at upper-chest or chin level is sufficient and comfortable.',
      'Lower under control back to the starting position.',
      'Avoid using a swinging torso to generate momentum — the pull should come from the shoulders and traps.',
    ],
    breathing: [
      'Breathe in before pulling.',
      'Exhale as you pull upward or at the top.',
      'Breathe in on the way down.',
    ],
    cues: [
      '"Elbows lead" — the elbows should travel higher than the wrists throughout the pull.',
      '"Stop where it is comfortable" — there is no universal correct height; raise to where the shoulder feels stable.',
      '"Control the descent" — lower slowly rather than dropping the weight back down.',
      '"Wide grip for comfort" — a grip wider than hip width can feel more natural for the shoulder joint.',
    ],
    commonMistakes: [
      'Forcing the elbows to a fixed height regardless of shoulder comfort — adjust the range to what is pain-free.',
      'Close grip creating shoulder discomfort — try a wider grip as a first adjustment.',
      'Swinging the torso to pull the weight — momentum bypasses the target muscles.',
      'Pulling the bar so high it contacts the chin — this is not required and a more moderate range is equally effective.',
    ],
    variations: [
      {
        name: 'Dumbbell Upright Row',
        purpose: 'Dumbbells allow the hands to travel a more natural path rather than being locked to a fixed bar.',
        formChange: 'Hold a dumbbell in each hand. Pull upward in the same pattern, elbows leading.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Upright Row',
        purpose: 'Consistent cable tension throughout the range; easy to adjust load.',
        formChange: 'Set a cable at the lowest position. Grip the bar and pull upward in the same pattern.',
        difficulty: 'similar',
      },
      {
        name: 'Lateral Raise',
        purpose: 'An alternative that trains the lateral deltoid without the internal-rotation position of an upright row.',
        formChange: 'Raise the arms outward to the sides rather than pulling vertically. No bar involved.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Some people experience shoulder discomfort with upright rows — particularly at a close grip and when pulling to chin height. Adjusting grip width and limiting the range of motion are practical first steps.',
      'If discomfort persists regardless of grip or range of motion, lateral raises and cable high pulls offer similar training stimulus with a different shoulder position.',
      'Do not force the shoulder into a position that feels unstable or painful.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Shrugs ────────────────────────────────────────────────────────────────────
  'shrugs': {
    exerciseKey: 'shrugs',
    displayName: 'Shrugs',
    summary:
      'A simple shoulder-elevation movement with a barbell, dumbbells, or cables that primarily ' +
      'trains the upper trapezius. The movement is a vertical shrug of the shoulders — ' +
      'not a circular roll.',
    setup: [
      'Hold a barbell in front of you at hip height (or dumbbells at the sides), arms straight.',
      'Stand with feet hip-width apart, posture upright.',
      'Let the shoulders start in a relaxed, natural position — not pre-elevated.',
      'Grip should be firm but not white-knuckled; straps are a practical option if grip limits the set before the traps do.',
    ],
    execution: [
      'Elevate both shoulders straight upward — imagine trying to touch your ears with your shoulders.',
      'Hold briefly at the top before lowering under control.',
      'Lower the shoulders fully to a relaxed position between reps.',
      'Avoid rolling the shoulders forward or backward — a straight vertical elevation is sufficient and more consistent.',
      'Keep the neck relaxed; there is no need to tuck or strain the head during the lift.',
    ],
    breathing: [
      'Breathe in before shrugging.',
      'Exhale at the top of the shrug or as you lower.',
      'Keep breathing steadily across the set.',
    ],
    cues: [
      '"Straight up, straight down" — the shrug is a vertical movement; rolling adds complexity without adding benefit.',
      '"Pause at the top" — a brief hold makes the contraction more deliberate.',
      '"Neck stays long" — avoid shortening the neck or tensing the jaw during the shrug.',
      '"Full lower" — coming all the way down between reps maintains the full range of motion.',
    ],
    commonMistakes: [
      'Rolling the shoulders — circular rolling is not necessary and can feel uncomfortable on the shoulder joint under load.',
      'Not holding at the top — rushing through removes the peak contraction benefit.',
      'Not lowering fully between reps — short reps limit the range of motion and the training stimulus.',
      'Bending the elbows — the arms should stay straight throughout; any arm bending turns the movement into a partial row.',
      'Straining the neck — the neck should be relaxed; the traps, not the neck muscles, should be doing the work.',
    ],
    variations: [
      {
        name: 'Dumbbell Shrugs',
        purpose: 'Dumbbells allow the hands to rest naturally at the sides rather than in front of the body; some people find this more comfortable.',
        formChange: 'Hold a dumbbell in each hand at the sides. Shrug straight up in the same pattern.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Shrugs',
        purpose: 'Consistent tension through the range of motion; easier to adjust load incrementally.',
        formChange: 'Set a cable at floor height. Grip the bar and perform the same straight-up shrug.',
        difficulty: 'similar',
      },
      {
        name: 'Barbell Behind-the-back Shrug',
        purpose: 'Bar behind the hips changes the angle of pull on the traps slightly.',
        formChange: 'Hold the barbell behind you at hip level. Shrug straight up in the same pattern.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Use straps or hook grips if grip fatigue consistently limits your sets before the traps are worked.',
      'Neck soreness after shrugs is sometimes related to unconscious neck tension during the lift — focus on a long, relaxed neck.',
      'Avoid loading shrugs so heavily that you cannot maintain a straight-up shrug path and a controlled descent.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Cable Lateral Raises ──────────────────────────────────────────────────────
  'cable-lateral-raises': {
    exerciseKey: 'cable-lateral-raises',
    displayName: 'Cable Lateral Raises',
    summary:
      'A cable-based version of the lateral raise that provides tension at the bottom of the arc — ' +
      'where dumbbells have little resistance. This makes the shoulder work through more of its range ' +
      'than a dumbbell version typically allows.',
    setup: [
      'Set the cable pulley at the lowest position.',
      'Stand beside the cable station with the working arm closest to the machine.',
      'Grip the handle with the hand farthest from the machine, reaching across the body.',
      'Stand tall with a slight stance for stability; the free hand can hold the machine for support.',
      'The cable should be pulling slightly across your body at the bottom — this is what provides tension through the bottom of the arc.',
    ],
    execution: [
      'Raise the arm outward to roughly shoulder height in a wide arc, maintaining a slight elbow bend.',
      'Keep the movement smooth — the cable provides consistent tension that rewards a controlled pace.',
      'Pause briefly at the top before lowering under control.',
      'Avoid leaning away from the machine with the trunk to assist the raise — keep the torso stable.',
      'Complete all reps on one side before switching.',
    ],
    breathing: [
      'Breathe out as you raise the arm.',
      'Breathe in as you lower.',
      'Keep breathing steadily throughout.',
    ],
    cues: [
      '"Bottom tension is the point" — the benefit over dumbbells is the cable load at the start of the arc.',
      '"Torso stays still" — any lateral lean shifts the movement away from the shoulder.',
      '"Lead with the elbow" — the elbow tracks slightly above the wrist throughout the arc.',
      '"Slow the descent" — the cable makes it easy to lower quickly; resist that temptation.',
    ],
    commonMistakes: [
      'Leaning away from the cable — this changes the pulling angle and is often a sign the load is too heavy.',
      'Using momentum to swing the arm up — slow controlled raises yield better lateral delt work.',
      'Setting the cable too high — the pulley should be at floor level to maintain the tension at the bottom of the arc.',
      'Pulling the handle too far across the body at the start — a gentle cross-body position is fine; reaching awkwardly can strain the shoulder.',
    ],
    variations: [
      {
        name: 'Dumbbell Lateral Raise',
        purpose: 'No cable machine required; provides more load at the top of the arc and less at the bottom.',
        formChange: 'Hold dumbbells at the sides. Raise outward to shoulder height in the same arc.',
        difficulty: 'similar',
      },
      {
        name: 'Behind-the-body Cable Lateral Raise',
        purpose: 'Running the cable behind the back slightly changes the angle of pull on the lateral delt.',
        formChange: 'Set the cable low on the opposite side. Pass the cable behind your body and raise the arm on the near side.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Cable Lateral Raise (facing the machine)',
        purpose: 'Standing facing the cable provides a slightly different arc and tension profile.',
        formChange: 'Face the cable machine. Grip the handle with the arm opposite the machine. Raise outward.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Start with a lighter load than your dumbbell lateral raise — the constant cable tension can feel harder through the full arc.',
      'Shoulder discomfort at the top of the range can often be addressed by stopping just below horizontal.',
      'Do not force the shoulder into a position that feels unstable or painful.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Press ──────────────────────────────────────────────────────────
  'kettlebell-press': {
    exerciseKey: 'kettlebell-press',
    displayName: 'Kettlebell Press',
    summary:
      'A single-arm overhead pressing movement using a kettlebell held in the rack position. ' +
      'The offset weight of the kettlebell challenges wrist alignment and shoulder stability differently ' +
      'from a dumbbell, and the single-arm nature requires core anti-rotation control.',
    setup: [
      'Clean the kettlebell to the rack position: forearm roughly vertical, bell resting on the outside of the forearm, elbow close to the ribs.',
      'Wrist should be straight or only very slightly extended — the bell should feel secure, not tilting.',
      'Stand with feet hip-width apart, brace your core before pressing.',
      'Squeeze the glutes on the working side for added trunk stability.',
      'The rack position takes practice — if it feels awkward, start with a lighter bell and practise the clean and rack separately.',
    ],
    execution: [
      'Press the kettlebell straight overhead until the arm reaches full extension.',
      'At lockout, the bicep should be close to or beside the ear — the arm is vertical, not angled forward.',
      'Lower back to the rack position under control.',
      'Keep the trunk stable throughout — avoid leaning sideways to complete the press.',
      'Choose a load you can press with a straight-up path; leaning is a sign the load is too heavy or the rack position is not stable.',
    ],
    breathing: [
      'Breathe in and brace before pressing.',
      'Exhale at the top or just past the sticking point.',
      'Re-brace before the next rep.',
    ],
    cues: [
      '"Rack first, press second" — the quality of the rack position determines the quality of the press.',
      '"Straight wrist" — the bell should not tilt the wrist back excessively during the press.',
      '"Bicep beside the ear at lockout" — a useful check for full overhead extension.',
      '"Core braced against rotation" — the body should not rotate toward the pressing arm during the lift.',
    ],
    commonMistakes: [
      'Wrist bending backward during the press — practice the rack and press with a lighter bell until the wrist stays aligned.',
      'Leaning away from the pressing arm — the trunk should remain vertical; lean is a sign of insufficient strength or an unstable rack.',
      'The bell tilting backward at the top — the arm should be vertical with the bell balanced above the forearm.',
      'Pressing from a poor rack position — if the rack feels unstable, stop and reset before pressing.',
      'Gripping the handle too tightly — a moderate, controlled grip is sufficient; white-knuckling the bell does not add stability.',
    ],
    variations: [
      {
        name: 'Bottom-up Kettlebell Press',
        purpose: 'Pressing with the bell inverted (handle down, ball up) demands much more wrist and shoulder stability.',
        formChange: 'Grip the handle and hold the bell upside down. Press with the ball pointing upward throughout.',
        difficulty: 'harder',
      },
      {
        name: 'Half-kneeling Kettlebell Press',
        purpose: 'Kneeling on the same-side knee as the pressing arm changes the hip and trunk stability demand.',
        formChange: 'Drop to one knee. The same-side knee is down. Press from the rack position on the kneeling-side arm.',
        difficulty: 'similar',
      },
      {
        name: 'Double Kettlebell Press',
        purpose: 'Pressing two kettlebells simultaneously doubles the load and the bilateral shoulder demand.',
        formChange: 'Clean two kettlebells to the rack position. Press both at the same time.',
        difficulty: 'harder',
      },
      {
        name: 'Dumbbell Shoulder Press',
        purpose: 'A more stable implement for building overhead pressing strength before transitioning to the kettlebell rack position.',
        formChange: 'Hold dumbbells at shoulder height. Press overhead with the same vertical path.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Master the clean and rack position with a light bell before adding pressing load — a poor rack creates instability at the shoulder.',
      'Forearm bruising from the clean is common for beginners — it reduces as technique improves.',
      'Do not force the shoulder into overhead range if the rack position is not stable.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Halo ───────────────────────────────────────────────────────────
  'kettlebell-halo': {
    exerciseKey: 'kettlebell-halo',
    displayName: 'Kettlebell Halo',
    summary:
      'A mobility and stability exercise where a light kettlebell is circled around the head in a ' +
      'controlled arc. It moves the shoulder through a large range of motion while the trunk stays ' +
      'stable — commonly used as a warm-up or accessory movement.',
    setup: [
      'Hold the kettlebell by the horns (both hands gripping the sides of the handle) at chest level, bell facing down.',
      'Stand or kneel — kneeling removes lower-body compensation and focuses the movement on the trunk and shoulder.',
      'Start with a light bell; this is not a strength exercise and heavy loading is counterproductive.',
      'Stand tall with feet hip-width apart and the core lightly braced.',
    ],
    execution: [
      'Begin moving the kettlebell in an arc around your head, keeping the bell as close to the head as comfortably possible.',
      'The path goes from in front of the face, around one side of the head, behind the neck, around the other side, and back to the front.',
      'Keep the ribs pulled down and the trunk stable — avoid letting the lower back arch or the ribs flare as the bell passes behind.',
      'Move at a slow, deliberate pace; this is a controlled movement, not a swing.',
      'Complete a set number of circles in one direction, then reverse.',
    ],
    breathing: [
      'Breathe steadily throughout — the movement should not require breath-holding.',
      'A light exhale as the bell passes in front (the more demanding phase) is a useful pattern.',
    ],
    cues: [
      '"Ribs down" — the most common failure point is the lower back arching as the bell passes behind the head.',
      '"Bell close to the head" — a tighter arc means more control and a more effective movement.',
      '"Slow and deliberate" — rushing through halos reduces the mobility and stability benefit.',
      '"Tall posture" — the head should not duck toward the bell; the bell moves around the head.',
    ],
    commonMistakes: [
      'Using a bell that is too heavy — the halo is a mobility drill, not a strength exercise; a very light bell is appropriate.',
      'Arching the lower back as the bell passes behind — brace the trunk and keep the ribs neutral.',
      'Ducking or tilting the head to make room — the head should stay still while the bell circles around it.',
      'Rushing the movement — a slow, controlled arc is more effective than a fast swing.',
    ],
    variations: [
      {
        name: 'Kneeling Kettlebell Halo',
        purpose: 'Removes any lower-body compensation and requires the trunk to work harder to stay stable.',
        formChange: 'Kneel on both knees (or one knee) instead of standing. Same circular path around the head.',
        difficulty: 'similar',
      },
      {
        name: 'Plate Halo',
        purpose: 'A weight plate is an alternative to a kettlebell; the flat shape can be easier to grip.',
        formChange: 'Hold a weight plate by the edges at chest height. Circle it around the head in the same controlled arc.',
        difficulty: 'similar',
      },
      {
        name: 'Seated Halo',
        purpose: 'Sitting on a bench removes the lower-body stability element entirely.',
        formChange: 'Sit upright on a bench. Perform the same circular path with the bell.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Use a light bell — heavier halos tend to force the lower back to arch to compensate, which defeats the purpose of the exercise.',
      'Keep the movement slow enough to stop at any point — this is especially important when learning the path behind the head.',
      'If the shoulder has limited range that makes the behind-the-neck portion uncomfortable, reduce the arc size rather than forcing it.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Clean and Press ────────────────────────────────────────────────
  'kettlebell-clean-and-press': {
    exerciseKey: 'kettlebell-clean-and-press',
    displayName: 'Kettlebell Clean and Press',
    summary:
      'A two-phase movement that combines a clean (lifting the bell from the floor to the rack ' +
      'position) with a strict overhead press. It trains the posterior chain, shoulders, and ' +
      'triceps while requiring full-body coordination.',
    setup: [
      'Stand with the kettlebell on the floor between your feet, roughly centred under your hip.',
      'Hinge at the hips to grip the handle, arm straight, shoulder over the bell.',
      'Brace your core before the clean phase begins.',
      'The rack position is the goal of the clean phase — the forearm vertical, bell resting on the outside of the forearm, elbow close to the ribs.',
      'Practise the clean and the press as separate exercises before linking them.',
    ],
    execution: [
      'Initiate the clean with a hip-hinge drive — not a bicep curl. The hips extend and the bell travels in a tight arc close to the body.',
      'As the bell reaches chest height, rotate your forearm under the bell to catch it in the rack position.',
      'Allow the bell to settle into the rack before pressing — do not rush from the clean into the press.',
      'Press from the rack position straight overhead to full extension, bicep beside the ear.',
      'Lower the bell to the rack, then return to the floor by reversing the clean under control.',
    ],
    breathing: [
      'Breathe in and brace before the clean.',
      'Exhale as the bell settles into the rack.',
      'Re-brace, then exhale through the press.',
      'Breathe in before lowering back to the floor.',
    ],
    cues: [
      '"Hip drive, not arm curl" — the clean is powered by the hips, not the bicep.',
      '"Bell stays close" — a bell that swings away from the body during the clean is harder to receive in a controlled rack.',
      '"Quiet rack" — the bell should land softly in the rack position, not crash onto the forearm.',
      '"Press from stable rack" — pause in the rack before pressing rather than chaining the two movements without control.',
    ],
    commonMistakes: [
      'Curling the bell up with the arm rather than using hip drive — this limits the load and strains the bicep.',
      'The bell crashing onto the forearm — caused by the bell swinging out too wide; keep the path close to the body.',
      'Pressing before the rack is stable — rushing from the clean to the press leads to poor rack position and an unstable press.',
      'Using a push-press (knee dip) instead of a strict press without intending to — add a knee dip deliberately only if that is the goal.',
      'Lowering the bell too quickly back to the floor — control the descent just as you control the ascent.',
    ],
    variations: [
      {
        name: 'Kettlebell Clean (alone)',
        purpose: 'Practising the clean phase in isolation before adding the press; essential for building technique.',
        formChange: 'Perform only the clean phase from the floor to the rack position, then lower and repeat.',
        difficulty: 'easier',
      },
      {
        name: 'Kettlebell Press (from rack, no clean)',
        purpose: 'Practising the press phase independently to build overhead strength without the clean complexity.',
        formChange: 'Clean the bell once and hold in the rack. Perform multiple press reps from the rack without re-cleaning.',
        difficulty: 'easier',
      },
      {
        name: 'Double Kettlebell Clean and Press',
        purpose: 'Two kettlebells double the load and coordination demand.',
        formChange: 'Clean two kettlebells simultaneously. Press both at the same time from the double-rack position.',
        difficulty: 'harder',
      },
      {
        name: 'Kettlebell Clean and Push Press',
        purpose: 'Adds a knee dip before the press to assist heavier loads past the sticking point.',
        formChange: 'Clean to the rack, then use a brief leg drive to initiate the press before locking out with the shoulder.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Master the clean and the press as separate movements before combining them — the combined movement requires both skills.',
      'Forearm bruising from the clean is common for beginners; it reduces as technique and the rack position improve.',
      'Do not force the clean or the press through a range that feels unstable — reduce the load first.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Front Raise ────────────────────────────────────────────────────
  'kettlebell-front-raise': {
    exerciseKey: 'kettlebell-front-raise',
    displayName: 'Kettlebell Front Raise',
    summary:
      'A front-delt accessory movement using a kettlebell held by the horns or the handle. ' +
      'The arc and grip are slightly different from a dumbbell front raise, and it can be ' +
      'performed with one or two hands.',
    setup: [
      'Stand with feet hip-width apart, tall posture.',
      'For a two-arm raise: hold the kettlebell by the horns at hip height, bell facing down.',
      'For a single-arm raise: grip the handle in one hand at the side.',
      'Use a light load — the front delt is relatively small and is already trained by most pressing work.',
      'Core lightly braced before beginning.',
    ],
    execution: [
      'Raise the kettlebell forward to roughly shoulder height, keeping the elbows slightly bent.',
      'Pause briefly at the top before lowering under control.',
      'Avoid using the trunk to swing the bell — the raise should come from the shoulder.',
      'Keep the ribs pulled down; do not let the lower back arch to reach shoulder height.',
      'Lower slowly — a controlled descent increases the training stimulus.',
    ],
    breathing: [
      'Breathe out as you raise the bell.',
      'Breathe in as you lower it.',
      'Keep breathing steadily throughout the set.',
    ],
    cues: [
      '"Raise to parallel" — shoulder height is a practical and sufficient endpoint.',
      '"Ribs down" — avoid rib flare or lower-back arch at the top.',
      '"Controlled descent" — resist the bell on the way down rather than letting gravity take it.',
      '"Minimal trunk movement" — if the torso is swinging, reduce the load.',
    ],
    commonMistakes: [
      'Using momentum from the legs or trunk to raise the bell — reduces the demand on the front delt.',
      'Raising significantly above shoulder height — adds little front delt benefit and increases upper-trap involvement.',
      'Rib flare at the top of the raise — keep the core braced and the ribs neutral.',
      'Too heavy a load — the kettlebell front raise should use a modest weight for clean, controlled reps.',
    ],
    variations: [
      {
        name: 'Dumbbell Front Raise',
        purpose: 'A standard dumbbell alternative with a more conventional grip.',
        formChange: 'Hold a dumbbell in one or both hands. Raise forward to shoulder height.',
        difficulty: 'similar',
      },
      {
        name: 'Plate Front Raise',
        purpose: 'A plate held with both hands provides a stable, symmetrical grip.',
        formChange: 'Hold a weight plate at the sides. Raise forward with both arms.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Front Raise',
        purpose: 'Provides consistent tension at the bottom of the arc that dumbbells and kettlebells lack.',
        formChange: 'Set a cable at floor level. Face away from the machine and raise the handle from hip to shoulder height.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'The front deltoid is heavily trained by pressing movements — keep front raise volume moderate and loads light.',
      'Shoulder discomfort at the top of the range can usually be addressed by stopping just below shoulder height.',
      'Do not force the shoulder into a position that feels unstable or painful.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Handstand Push-ups ────────────────────────────────────────────────────────
  'handstand-push-ups': {
    exerciseKey: 'handstand-push-ups',
    displayName: 'Handstand Push-ups',
    summary:
      'An advanced vertical pressing movement performed upside down, using the wall for balance ' +
      'support. It trains the shoulders, triceps, and upper traps under full bodyweight load. ' +
      'Significant overhead pressing strength, shoulder stability, and a degree of balance control ' +
      'are required before attempting this movement.',
    setup: [
      'Build prerequisite strength: pike push-ups, elevated pike push-ups, and overhead pressing should feel strong before attempting wall-assisted handstand push-ups.',
      'Place your hands roughly shoulder-width apart (or slightly wider) on the floor, roughly 15–30 cm from the wall.',
      'Kick up or walk your feet up the wall to a handstand position — walk the feet up rather than kicking up powerfully if you are new to this.',
      'Once in position, your body should be as vertical as possible with the core braced and the lower back not excessively arched.',
      'The head looks at the floor rather than toward the wall.',
    ],
    execution: [
      'Lower your head toward the floor by bending your elbows, keeping the elbows tracking roughly over your hands rather than flaring very wide.',
      'Lower to a depth you can control — the top of the head touching or approaching the floor is the full-range endpoint, but a partial range is a valid starting point.',
      'Press back up to full lockout.',
      'Choose a range of motion you can safely return from — the ability to press back up is as important as the ability to lower.',
      'When finished, walk your feet down the wall rather than dropping away from it.',
    ],
    breathing: [
      'Breathe in before lowering.',
      'Exhale as you press back up or at lockout.',
      'Avoid holding your breath through the full movement — the inverted position makes breathing feel effortful, but continue breathing.',
    ],
    cues: [
      '"Hands close to the wall" — too much distance from the wall makes the balance more difficult and the body less vertical.',
      '"Core braced" — a braced midsection keeps the body in a more vertical line and reduces lower-back arching.',
      '"Slow the descent" — a controlled lowering phase builds the strength and confidence needed for this skill.',
      '"Press, do not drift" — the press should be vertically upward, not toward the wall.',
    ],
    commonMistakes: [
      'Attempting handstand push-ups without sufficient pressing strength — build a foundation with pike push-ups and overhead pressing first.',
      'Hands placed too far from the wall — reduces the verticality of the position and makes balance harder.',
      'Excessive lower-back arch — indicates insufficient core bracing or insufficient overhead shoulder flexibility.',
      'Lowering to a depth you cannot press back from — start with a partial range of motion and build depth gradually.',
      'Kicking up with too much force when learning — walking the feet up the wall is safer and more controlled.',
    ],
    variations: [
      {
        name: 'Elevated Pike Push-up',
        purpose: 'Feet on a box or bench increase the shoulder angle without requiring a full inversion; a key regression.',
        formChange: 'Place feet on an elevated surface. Hands on the floor in a pike. Lower the head toward the floor.',
        difficulty: 'easier',
      },
      {
        name: 'Partial-range Handstand Push-up',
        purpose: 'Starting with a limited descent builds strength safely before working toward full range.',
        formChange: 'In the wall-supported handstand position, lower only as far as you can comfortably press back up from.',
        difficulty: 'easier',
      },
      {
        name: 'Pike Push-up',
        purpose: 'A floor-based version with a less extreme angle; an earlier step in the progression.',
        formChange: 'Hips elevated in a pike on the floor. Lower the head toward the floor between the hands.',
        difficulty: 'easier',
      },
      {
        name: 'Freestanding Handstand Push-up',
        purpose: 'The ultimate progression — no wall for balance; requires handstand skill in addition to pressing strength.',
        formChange: 'Balance in a freestanding handstand and perform the same press. Only appropriate after the wall-assisted version is fully controlled.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Do not attempt handstand push-ups until you can confidently walk up to and hold a wall-supported handstand — the pressing demand without the balance skill is a recipe for an uncontrolled fall.',
      'Wrist discomfort is common in the handstand position — warm up the wrists thoroughly and consider push-up handles if it persists.',
      'Neck and shoulder stress increases significantly if you fall out of a vertical line — practise with a spotter or soft mat when learning.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Wall Walk ─────────────────────────────────────────────────────────────────
  // Shared record: Shoulders + Core (do not add again in the Core batch)
  'wall-walk': {
    exerciseKey: 'wall-walk',
    displayName: 'Wall Walk',
    summary:
      'A progressive inversion movement where you begin in a push-up plank, walk your feet up a wall ' +
      'behind you, and walk your hands toward the wall until you reach a near-handstand or handstand ' +
      'position. It challenges shoulder strength, overhead control, trunk stability, and full-body ' +
      'coordination — and importantly, requires you to walk back down under control.',
    setup: [
      'Start in a push-up plank position with your feet against the base of the wall, toes touching.',
      'Hands should be flat on the floor, roughly shoulder-width apart.',
      'Brace your core before moving — the trunk should remain stable throughout.',
      'Choose a goal position for this session: a modest inversion (feet at hip or waist height) is a valid and effective target; a full handstand is not required.',
      'Ensure you have enough clear space in front of you to walk your hands forward during the return.',
    ],
    execution: [
      'From the plank, push one foot up the wall, then the other, so your feet are elevated.',
      'Walk your hands toward the wall while your feet walk higher — the body becomes increasingly vertical.',
      'Move slowly and deliberately; each hand and foot placement should feel stable before the next.',
      'Stop at a position you can comfortably return from — do not walk higher than you can safely descend.',
      'To return, walk your hands away from the wall and your feet down the wall in the reverse sequence.',
    ],
    breathing: [
      'Breathe steadily throughout the movement.',
      'A short exhale during each hand or foot movement can help with stability.',
      'Avoid holding your breath for the duration of the walk — the effort can feel intense, especially near the inverted position.',
    ],
    cues: [
      '"Move one limb at a time" — small, deliberate steps are safer than large, rapid movements.',
      '"Core on throughout" — a braced trunk prevents the lower back from arching as the body becomes more vertical.',
      '"Stop where you can return" — only move to a position you can reverse without rushing.',
      '"Slow the return" — walking back down requires the same control as walking up.',
    ],
    commonMistakes: [
      'Walking up too quickly — speed reduces control; slow deliberate movement is the goal.',
      'Going higher than you can safely descend from — always maintain the ability to walk back down.',
      'Losing trunk control as the body approaches vertical — rib flare or lower-back arch indicate the core is not maintaining position.',
      'Rushing the descent — walking back down should be just as controlled as the ascent.',
      'Attempting a full handstand position before building the necessary shoulder strength and body awareness — start with a modest inversion and progress over time.',
    ],
    variations: [
      {
        name: 'Incline Wall Walk',
        purpose: 'A partial wall walk stopping when the feet are at hip or chest height; a beginner-friendly version.',
        formChange: 'Walk your feet up to hip or waist height only. Hold briefly, then walk back down.',
        difficulty: 'easier',
      },
      {
        name: 'Elevated Pike Push-up',
        purpose: 'Builds the shoulder and trunk strength needed for wall walks without the balance challenge of inversion.',
        formChange: 'Place feet on a box or bench with hips elevated. Lower the head toward the floor in a pike position.',
        difficulty: 'easier',
      },
      {
        name: 'Full Wall Walk to Handstand Hold',
        purpose: 'Walking all the way to a near-handstand and holding — a natural progression once the movement is well-controlled.',
        formChange: 'Walk hands to within a few inches of the wall and hold the near-vertical position for a timed hold.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Wrist discomfort is common in this position — warm up the wrists before attempting wall walks and use push-up handles if needed.',
      'Shoulder fatigue near an inverted position can happen quickly — begin with a limited inversion and build endurance gradually.',
      'Never move to a position you are not confident you can descend from — getting stuck near the top is a fall risk.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ARMS
  // ════════════════════════════════════════════════════════════════════════════

  // ── Barbell Curl ──────────────────────────────────────────────────────────────
  'barbell-curl': {
    exerciseKey: 'barbell-curl',
    displayName: 'Barbell Curl',
    summary:
      'A standing bilateral curl using a barbell that trains the biceps and brachialis. ' +
      'The fixed bar path keeps both arms working at the same load and cadence.',
    setup: [
      'Stand with feet hip-width apart and hold the barbell with an underhand (supinated) grip, hands roughly shoulder-width apart.',
      'Let the bar hang at hip height with arms fully extended at the start.',
      'Keep the elbows close to the sides of your torso throughout — they are the pivot point of the movement.',
      'Stand tall with a natural posture and core lightly braced.',
      'A straight barbell or an EZ-curl bar are both valid choices; an EZ-bar can feel more comfortable on the wrists.',
    ],
    execution: [
      'Curl the bar upward by bending the elbows, keeping the upper arms relatively still against your sides.',
      'Continue until the forearms are roughly vertical or the biceps are fully shortened — whichever comes first without the elbows drifting forward.',
      'Squeeze briefly at the top, then lower the bar under control back to full extension.',
      'Avoid swinging the torso to help the bar up — the movement comes from the elbows, not the hips.',
      'Choose a range of motion you can control comfortably; full extension at the bottom maintains the stretch.',
    ],
    breathing: [
      'Breathe in before curling.',
      'Exhale as you curl up or at the top.',
      'Breathe in as you lower.',
      'Keep breathing steadily across the set.',
    ],
    cues: [
      '"Elbows stay pinned" — the upper arm should not swing forward during the curl.',
      '"Control the descent" — lowering slowly through a full range of motion yields more stimulus than a fast drop.',
      '"Grip relaxed" — excessive grip tension can fatigue the forearms before the biceps; ease the grip slightly.',
      '"Full extension at the bottom" — a complete lowering maintains the range of motion and the stretch.',
    ],
    commonMistakes: [
      'Swinging the torso back — this is momentum, not bicep work; reduce the load if it is happening consistently.',
      'Elbows drifting forward as the bar approaches the top — keep the upper arm fixed beside the torso.',
      'Shortening the range of motion at the bottom — partial reps limit the bicep\'s time under tension.',
      'Gripping too tightly — forearm fatigue can limit the set; a firm but relaxed grip is sufficient.',
      'Wrist discomfort with a straight bar — an EZ-curl bar or dumbbells are practical alternatives.',
    ],
    variations: [
      {
        name: 'EZ-bar Curl',
        purpose: 'The angled grip can reduce wrist and elbow discomfort for some people.',
        formChange: 'Use an EZ-curl bar instead of a straight bar. Grip at the angled sections. Same curl pattern.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Curl',
        purpose: 'Each arm works independently; useful for identifying left-right differences.',
        formChange: 'Hold a dumbbell in each hand. Curl with the same upper-arm-fixed technique.',
        difficulty: 'similar',
      },
      {
        name: 'Incline Dumbbell Curl',
        purpose: 'The inclined position stretches the bicep at the bottom of the curl, increasing the range of motion.',
        formChange: 'Lie back on an incline bench at 45–60°. Let the dumbbells hang at the sides. Curl from full extension.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Curl',
        purpose: 'Cable provides constant tension through the full range, including at the top where a barbell loses tension.',
        formChange: 'Set a cable at floor level. Grip the bar and curl upward with the same elbow-fixed technique.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Wrist or elbow discomfort with a straight barbell can often be addressed by switching to an EZ-bar or dumbbells.',
      'Avoid forcing the elbows forward at the top of the rep — this shifts load to the front shoulder rather than the bicep.',
      'Do not use a load so heavy that torso swinging becomes necessary to complete reps.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Dumbbell Curl ─────────────────────────────────────────────────────────────
  'dumbbell-curl': {
    exerciseKey: 'dumbbell-curl',
    displayName: 'Dumbbell Curl',
    summary:
      'A unilateral or bilateral curl using dumbbells that trains the biceps and brachialis. ' +
      'The independent arm movement allows a natural wrist rotation through the curl and ' +
      'can reveal left-right strength differences.',
    setup: [
      'Stand or sit with a dumbbell in each hand, arms hanging at full extension, palms facing inward or forward.',
      'Keep the elbows close to the sides of the torso throughout.',
      'A seated position on an upright bench can reduce the temptation to use torso momentum.',
      'Use a load that allows full control through the complete range of motion.',
    ],
    execution: [
      'Curl the dumbbell upward, rotating the wrist from neutral to supinated (palm up) as the arm rises — if that rotation feels comfortable for your wrist.',
      'Keep the upper arm relatively still; the elbow is the pivot.',
      'Lift until the bicep is fully shortened without the elbow swinging forward.',
      'Lower under control back to full extension, rotating the wrist back to neutral if you supinated during the lift.',
      'You can curl both arms simultaneously or alternate sides each rep — both are valid approaches.',
    ],
    breathing: [
      'Breathe out as you curl up.',
      'Breathe in as you lower.',
      'On alternating curls, breathe once per rep rather than per arm.',
    ],
    cues: [
      '"Supinate as you rise" — the rotation can increase bicep engagement for those whose wrists are comfortable with it.',
      '"Upper arm stays still" — the forearm should be the only segment moving.',
      '"Full extension at the bottom" — starting each rep from a complete stretch maintains range of motion.',
      '"Controlled descent" — the lowering phase contributes to the training stimulus.',
    ],
    commonMistakes: [
      'Swinging the shoulder forward to start the curl — the upper arm should not move; only the forearm rotates.',
      'Forced supination that causes wrist or elbow discomfort — keep the grip neutral if rotation feels uncomfortable.',
      'Shortening the bottom of the rep — extend fully at the bottom for a complete range of motion.',
      'Alternating so quickly that each rep is rushed — deliberate control per rep is more effective than speed.',
    ],
    variations: [
      {
        name: 'Alternating Dumbbell Curl',
        purpose: 'One arm at a time; the working arm gets full attention between reps.',
        formChange: 'Curl one arm at a time, lowering fully before curling the other side.',
        difficulty: 'similar',
      },
      {
        name: 'Seated Dumbbell Curl',
        purpose: 'Seated position reduces the ability to use torso momentum; useful for strict bicep work.',
        formChange: 'Sit upright on a bench. Perform the same curl pattern from a seated position.',
        difficulty: 'similar',
      },
      {
        name: 'Incline Dumbbell Curl',
        purpose: 'The inclined angle stretches the bicep at the bottom, working it through a longer range.',
        formChange: 'Lie back on an incline bench at roughly 45°. Let the arms hang at the sides. Curl from that stretched position.',
        difficulty: 'similar',
      },
      {
        name: 'Concentration Curl',
        purpose: 'Bracing the upper arm against the inner thigh removes any possibility of shoulder involvement.',
        formChange: 'Sit with knees wide. Rest the back of the upper arm on the inner thigh. Curl with the same hand.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'If wrist supination during the curl causes discomfort, keep the grip neutral (hammer position) throughout.',
      'Avoid loading so heavy that swinging is required — reduce the load rather than compromising the technique.',
      'Do not force the elbow into a position that feels uncomfortable at the top or bottom of the range.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Hammer Curl ───────────────────────────────────────────────────────────────
  'hammer-curl': {
    exerciseKey: 'hammer-curl',
    displayName: 'Hammer Curl',
    summary:
      'A curl performed with a neutral (thumbs-up) grip throughout. The neutral grip changes ' +
      'the forearm position and places relatively more emphasis on the brachialis and brachioradialis ' +
      'alongside the biceps.',
    setup: [
      'Stand or sit with a dumbbell in each hand, palms facing inward (thumbs pointing up) — this is the neutral grip used throughout the entire movement.',
      'Arms hang at full extension at the start.',
      'Keep the elbows close to the sides of the torso throughout the curl.',
      'Use a controlled load; the neutral grip can feel more natural for many wrists than a fully supinated curl.',
    ],
    execution: [
      'Curl both dumbbells upward while maintaining the neutral grip — the palms stay facing inward from start to finish.',
      'Keep the upper arms relatively still against your sides; only the forearms move.',
      'Lift until the forearms are roughly vertical or the bicep group is fully shortened.',
      'Lower under control back to full extension.',
      'You can curl both arms simultaneously or alternate sides.',
    ],
    breathing: [
      'Breathe out as you curl up.',
      'Breathe in as you lower.',
      'Keep breathing steadily throughout the set.',
    ],
    cues: [
      '"Thumbs up throughout" — the neutral grip should not rotate during the movement.',
      '"Elbows stay fixed" — the upper arm is the anchor; only the forearm moves.',
      '"Controlled descent" — the lowering phase trains the muscles under load; do not drop the weight.',
      '"Even grip pressure" — both hands should feel equal throughout the curl.',
    ],
    commonMistakes: [
      'Rotating the wrist into supination during the curl — a hammer curl specifically maintains the neutral position throughout.',
      'Elbows drifting forward at the top — keep the upper arm beside the torso.',
      'Swinging the torso — reduce the load if momentum from the hips or back is needed to complete reps.',
      'Shortening the range at the bottom — lower to a complete extension for maximum benefit.',
    ],
    variations: [
      {
        name: 'Cross-body Hammer Curl',
        purpose: 'Curling across the body toward the opposite shoulder slightly changes the angle of pull on the brachialis.',
        formChange: 'Instead of curling straight up, bring the dumbbell across the body toward the opposite shoulder. Alternate sides.',
        difficulty: 'similar',
      },
      {
        name: 'Alternating Hammer Curl',
        purpose: 'One arm at a time allows more deliberate attention to each side.',
        formChange: 'Curl one arm at a time in neutral grip, lowering fully before the other arm curls.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Hammer Curl (rope)',
        purpose: 'A rope attachment on a low cable allows a neutral grip with consistent cable tension.',
        formChange: 'Attach a rope to a low cable. Grip the rope ends in neutral position. Curl upward keeping the thumbs up.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Curl (supinated)',
        purpose: 'A fully supinated curl to compare the feel of pronated-to-supinated rotation against the fixed neutral grip.',
        formChange: 'Start palms inward, rotate to palms up during the curl. Full supination at the top.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'The neutral grip of the hammer curl is often more comfortable for those who experience wrist or elbow discomfort with a fully supinated curl.',
      'Avoid gripping so tightly that forearm fatigue limits the set before the biceps and brachialis are worked.',
      'Do not force the wrist into supination during this exercise — the neutral position is intentional.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Preacher Curl ─────────────────────────────────────────────────────────────
  'preacher-curl': {
    exerciseKey: 'preacher-curl',
    displayName: 'Preacher Curl',
    summary:
      'A curl performed with the upper arms braced against an angled pad, which limits the ability ' +
      'to use torso swing or shoulder movement. It trains the biceps through a well-controlled range ' +
      'with emphasis on the stretch at the bottom.',
    setup: [
      'Adjust the seat height so that your armpits rest comfortably on the top edge of the pad when seated.',
      'The upper arms rest along the angled surface of the pad — this is the fixed position they stay in.',
      'Grip the bar or dumbbells with an underhand grip at roughly shoulder width.',
      'Let the arms extend fully at the start to feel the bicep stretch before curling.',
      'Avoid an overly narrow grip that forces the wrists into an awkward position.',
    ],
    execution: [
      'Curl the weight upward, letting the elbows flex while the upper arms stay in contact with the pad.',
      'Lift until the forearms are roughly vertical or until you feel the biceps fully shortened.',
      'Lower under control back to a complete or near-complete extension — this is where the bicep is most stretched on the preacher curl.',
      'Do not lock out forcefully at the bottom — control the final phase of the descent rather than letting the arms drop to a hard stop.',
      'Choose a range of motion at the bottom that feels controlled and comfortable for your elbows.',
    ],
    breathing: [
      'Breathe in before curling or at the bottom.',
      'Exhale as you curl up or at the top.',
      'Breathe in as you lower.',
    ],
    cues: [
      '"Upper arms on the pad" — the pad is the anchor; the upper arms should not lift off it during the curl.',
      '"Controlled descent to stretch" — the bottom of the preacher curl is where the stretch is greatest; take it slowly.',
      '"No hard lockout" — control the bottom of the range rather than allowing the joints to snap into extension.',
      '"Squeeze at the top" — a brief hold at full flexion reinforces the contraction.',
    ],
    commonMistakes: [
      'Lifting the upper arms off the pad during the curl — this defeats the purpose of the preacher setup.',
      'Dropping the weight to a hard lockout at the bottom — the bicep tendon is under significant stretch here; control the descent.',
      'Using a weight so heavy it cannot be lowered slowly — reduce the load rather than risk fast, uncontrolled lowering.',
      'Seat set too low — if the armpits are well above the pad, the upper arms cannot brace correctly.',
      'Gripping too narrow — a very close grip can place the wrists in an uncomfortable position under load.',
    ],
    variations: [
      {
        name: 'EZ-bar Preacher Curl',
        purpose: 'The angled EZ-bar grip can reduce wrist and elbow discomfort compared to a straight bar.',
        formChange: 'Use an EZ-curl bar on the preacher bench. Grip at the angled section. Same movement.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Preacher Curl',
        purpose: 'Each arm works independently; useful for noticing and addressing left-right differences.',
        formChange: 'Hold a dumbbell in one hand on the preacher pad. Curl and lower with one arm at a time.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Preacher Curl',
        purpose: 'A cable attachment maintains tension even at the top of the curl where a barbell loses resistance.',
        formChange: 'Set a low cable behind the preacher bench. Reach back and curl the handle upward over the pad.',
        difficulty: 'similar',
      },
      {
        name: 'Concentration Curl',
        purpose: 'A seated alternative that braces the upper arm against the inner thigh rather than a pad.',
        formChange: 'Sit with knees wide. Brace the back of the upper arm on the inner thigh. Curl a dumbbell upward.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'The bottom of the preacher curl places the bicep tendon under significant load and stretch — control the descent and avoid hard lockout.',
      'Elbow discomfort at or near full extension is a signal to limit the range of motion at the bottom.',
      'Do not force the elbows into a position that feels uncomfortable against the pad.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Cable Curl ────────────────────────────────────────────────────────────────
  'cable-curl': {
    exerciseKey: 'cable-curl',
    displayName: 'Cable Curl',
    summary:
      'A curl using a cable machine that provides continuous tension through the entire range of ' +
      'motion, including the top where a barbell loses resistance. Adjustable pulley height and ' +
      'handle options make it a versatile bicep exercise.',
    setup: [
      'Set the cable pulley at the lowest position for a standard upright curl.',
      'Grip the straight bar or EZ-bar attachment with an underhand grip at roughly shoulder width.',
      'Stand facing the machine, a small step back so the cable is already under tension at the start.',
      'Let the arms hang at full extension before beginning.',
      'Keep the elbows close to the sides throughout.',
    ],
    execution: [
      'Curl the handle upward by bending the elbows, keeping the upper arms relatively still.',
      'Continue until the forearms are roughly vertical or the biceps are fully shortened.',
      'Hold briefly at the top — the cable maintains tension here where a barbell would not.',
      'Lower under control back to full extension, resisting the cable pull on the way down.',
      'Avoid leaning back or swinging the torso to complete the curl.',
    ],
    breathing: [
      'Breathe out as you curl up.',
      'Breathe in as you lower.',
      'Keep breathing steadily throughout the set.',
    ],
    cues: [
      '"Resist the cable down" — the lowering phase has consistent tension; use it.',
      '"Elbows fixed" — only the forearms move; the upper arms stay beside the torso.',
      '"Squeeze at the top" — the cable keeps the muscle loaded here, making the pause more productive.',
      '"Stand upright" — leaning away from the cable to lift more is momentum, not muscle.',
    ],
    commonMistakes: [
      'Leaning backward to assist the curl — step closer to the machine and reduce the load if this happens.',
      'Elbows drifting forward at the top — keep the upper arm fixed against the side of the torso.',
      'Letting the cable pull the arms down quickly — control the descent for the full eccentric benefit.',
      'Pulley set too high — a standard curl uses a low pulley; high pulleys change the exercise significantly.',
    ],
    variations: [
      {
        name: 'Single-arm Cable Curl',
        purpose: 'Trains one arm at a time; useful for addressing left-right differences.',
        formChange: 'Use a single handle. Stand beside the cable and curl with one arm.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Hammer Curl (rope)',
        purpose: 'A rope attachment with a neutral grip changes the forearm position and emphasis.',
        formChange: 'Attach a rope to the low cable. Grip the rope ends in neutral. Curl upward keeping thumbs up.',
        difficulty: 'similar',
      },
      {
        name: 'High-cable Curl',
        purpose: 'Cable set at face or head height; curling pulls the arm toward the head — a different arc and emphasis.',
        formChange: 'Set the pulley at face height. Stand back and curl the handle toward your head in a horizontal arc.',
        difficulty: 'similar',
      },
      {
        name: 'Barbell Curl',
        purpose: 'A free-weight alternative; heavier loading potential but less tension at the top.',
        formChange: 'Grip a barbell with an underhand hold at shoulder width. Curl in the same pattern standing freely.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Avoid positioning yourself so far from the machine that the cable pulls you off balance — stay within a controlled stance.',
      'Wrist discomfort with a straight bar can often be addressed by switching to an EZ-bar or rope attachment.',
      'Do not force the elbow position if curling causes discomfort at the joint.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Tricep Dips ───────────────────────────────────────────────────────────────
  'tricep-dips': {
    exerciseKey: 'tricep-dips',
    displayName: 'Tricep Dips',
    summary:
      'A pressing movement that trains the triceps with relatively more emphasis than a chest-focused ' +
      'parallel-bar dip. Keeping the torso more upright and the elbows tracking closer to the body ' +
      'shifts the demand toward the triceps. Can be performed on parallel bars or a bench.',
    setup: [
      'For parallel bars: grip both bars and support yourself at arm\'s length. Keep the torso upright — less forward lean than a chest dip.',
      'For a bench dip: sit on the edge of a bench, place hands beside your hips, and walk the feet forward. The more the feet are extended, the harder the movement.',
      'Brace the core before lowering.',
      'Keep the elbows tracking close to the body rather than flaring wide — this is the key setup distinction from a chest-focused dip.',
    ],
    execution: [
      'Lower the body by bending the elbows, keeping them relatively close to the sides throughout.',
      'Descend to a comfortable depth — roughly when the upper arms are parallel to the floor, or to where the shoulder feels stable.',
      'Press back up to full elbow extension without allowing the torso to lean forward significantly.',
      'Avoid locking the elbows with a snap at the top — reach full extension under control.',
      'Choose a depth you can control; build range gradually rather than forcing depth before shoulder and elbow are ready.',
    ],
    breathing: [
      'Breathe in as you lower.',
      'Breathe out as you press back up.',
      'Keep breathing steadily across the set.',
    ],
    cues: [
      '"Upright torso" — less forward lean keeps the triceps as the primary mover rather than the chest.',
      '"Elbows close" — tracking the elbows inward increases tricep emphasis.',
      '"Control the descent" — a rushed lowering reduces muscle tension and can stress the shoulder.',
      '"Full extension at the top" — reaching full lockout completes the tricep\'s range of motion.',
    ],
    commonMistakes: [
      'Leaning far forward — this shifts emphasis toward the chest and front shoulder; stay more upright for tricep emphasis.',
      'Elbows flaring wide — an elbows-out position loads the front shoulder more than the triceps.',
      'Descending so deep the shoulder rolls forward — build depth gradually.',
      'Swinging the hips or legs to generate momentum — keep the movement controlled and from the elbows.',
      'Bench dip with shoulders rounding forward — sit taller and keep the shoulder blades slightly back.',
    ],
    variations: [
      {
        name: 'Bench Dip',
        purpose: 'A supported version using a bench behind you; reduces the overall bodyweight demand.',
        formChange: 'Hands on bench edge behind you, feet on the floor or an elevated surface. Bend elbows and lower, then press back up.',
        difficulty: 'easier',
      },
      {
        name: 'Assisted Dip (band or machine)',
        purpose: 'Reduces the effective bodyweight; useful when building toward full unassisted dips.',
        formChange: 'Loop a band under your knees on the bars, or use an assisted dip machine. Same movement pattern.',
        difficulty: 'easier',
      },
      {
        name: 'Weighted Dip',
        purpose: 'Adds external load beyond bodyweight; a progression once unassisted dips are well-controlled.',
        formChange: 'Attach a weight via a dip belt. Maintain the upright torso and close-elbow technique.',
        difficulty: 'harder',
      },
      {
        name: 'Close-grip Bench Press',
        purpose: 'A horizontal alternative that trains the triceps with adjustable barbell load.',
        formChange: 'Lie on a flat bench. Grip the bar slightly inside shoulder width. Press with elbows tracking close.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Shoulder discomfort at the bottom of a dip is a signal to limit range of motion and build depth gradually.',
      'Bench dips with hands turned outward can place the shoulder in a less comfortable position — try turning hands forward or using parallel bars.',
      'Do not force the elbow or shoulder into a position that feels unstable or painful.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Close-grip Bench Press ────────────────────────────────────────────────────
  'close-grip-bench-press': {
    exerciseKey: 'close-grip-bench-press',
    displayName: 'Close-grip Bench Press',
    summary:
      'A flat bench press variation using a narrower grip that places relatively more emphasis on ' +
      'the triceps compared to a standard-width press. The chest and front shoulder still contribute; ' +
      'this is a compound movement, not a pure isolation exercise.',
    setup: [
      'Set up on a flat bench the same way you would for a standard bench press.',
      'Grip the bar with hands slightly inside shoulder width — a grip too narrow (e.g. hands touching) tends to strain the wrists and reduce stability.',
      'A grip roughly 10–15 cm inside your standard bench press grip is a common starting point.',
      'Retract and depress the shoulder blades before unracking.',
      'Wrists should be stacked over the forearms — avoid letting the wrists bend back under the bar.',
    ],
    execution: [
      'Unrack and lower the bar toward the lower chest or sternum with elbows tracking closer to the body than a wide-grip press.',
      'Elbows should angle roughly 45–60° from the torso rather than flaring wide.',
      'Touch or lightly graze the chest, then press back up to full elbow extension.',
      'Keep the shoulder-blade position throughout — avoid shrugging at the top.',
      'Choose a range of motion you can control comfortably.',
    ],
    breathing: [
      'Breathe in and brace before lowering.',
      'Hold the brace through the descent.',
      'Exhale at the top or just past the sticking point.',
    ],
    cues: [
      '"Elbows toward the hips" — tracking the elbows inward on the descent is the key change from a standard press.',
      '"Wrists over forearms" — a stacked wrist position keeps the load on the muscles rather than the joint.',
      '"Not too narrow" — a grip that is slightly inside shoulder width is close enough; very narrow grips add wrist stress without additional benefit.',
      '"Full extension at the top" — lockout completes the tricep\'s range of motion.',
    ],
    commonMistakes: [
      'Gripping too narrow — hands almost touching causes wrist strain and reduces stability; slightly inside shoulder width is sufficient.',
      'Elbows flaring out — a close-grip press works best with elbows tracking toward the body; flaring reduces tricep emphasis.',
      'Letting the wrists collapse backward — maintain a stacked wrist throughout the press.',
      'Bouncing the bar off the chest — use a controlled touch, not a bounce.',
    ],
    variations: [
      {
        name: 'Standard Bench Press',
        purpose: 'A wider grip shifts emphasis more toward the chest; useful as a comparison or primary compound lift.',
        formChange: 'Move the hands out to a standard shoulder-width or slightly wider position. Same press pattern.',
        difficulty: 'similar',
      },
      {
        name: 'Close-grip Dumbbell Press',
        purpose: 'Dumbbells allow a neutral or angled grip; can feel more comfortable on the wrists.',
        formChange: 'Hold dumbbells in a neutral or slightly inward grip. Press with elbows tracking close to the body.',
        difficulty: 'similar',
      },
      {
        name: 'Diamond Push-up',
        purpose: 'A bodyweight version with a similar close-hand emphasis on the triceps.',
        formChange: 'Place hands together in a diamond shape under the lower chest. Lower toward the hands with elbows tracking close.',
        difficulty: 'easier',
      },
      {
        name: 'Tricep Pushdown',
        purpose: 'An isolation tricep alternative using a cable; removes the chest and shoulder involvement.',
        formChange: 'Set a cable at head height. Push the handle downward with the elbows pinned to the sides.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Use a rack with safeties or a spotter — failing on the bench press with no backup is difficult to bail from safely.',
      'Wrist discomfort with the close grip is a signal to widen the grip slightly.',
      'Do not force the elbows into a position that feels unstable or painful under load.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Tricep Pushdown ───────────────────────────────────────────────────────────
  'tricep-pushdown': {
    exerciseKey: 'tricep-pushdown',
    displayName: 'Tricep Pushdown',
    summary:
      'A cable exercise where the triceps extend the elbow against cable resistance. ' +
      'The cable is set at a high anchor point and the movement is a downward push from ' +
      'roughly chest or elbow height to full extension at the sides.',
    setup: [
      'Set the cable pulley at a high position — roughly head or above-head height.',
      'Attach a straight bar, angled bar, rope, or single handle — the choice affects grip and wrist position.',
      'Stand facing the cable machine and step close enough that the cable tension is immediate at the start.',
      'Begin with the elbows bent at roughly 90° or slightly less, upper arms hanging at the sides.',
      'Keep the upper arms pinned close to the torso — they should not swing or move during the pushdown.',
    ],
    execution: [
      'Extend the elbows downward until the arms are fully straight — pushing the handle toward the floor.',
      'At full extension, squeeze the triceps briefly before allowing the arms to return.',
      'Return under control until the forearms are back at roughly the starting angle — do not let the elbows flare back with the cable.',
      'Keep the torso relatively upright; a slight forward lean is common and acceptable, but avoid bowing forward to push the weight.',
      'Choose a load that allows full elbow extension without recruiting the shoulder.',
    ],
    breathing: [
      'Breathe out as you push downward.',
      'Breathe in as you return.',
      'Keep breathing steadily across the set.',
    ],
    cues: [
      '"Upper arms stay still" — only the forearms move; the upper arm is pinned to the side of the torso.',
      '"Full extension at the bottom" — lock the elbows out fully to complete the tricep\'s range of motion.',
      '"Control the return" — resist the cable as the arms come back up.',
      '"No shoulder swing" — if the shoulders are moving to assist the push, reduce the load.',
    ],
    commonMistakes: [
      'Upper arms swinging forward and back — the upper arms should be stationary throughout.',
      'Using torso momentum to push the weight — lean slightly, but do not bow forward or use body swing.',
      'Stopping short of full extension — partial reps limit tricep engagement at the end range.',
      'Allowing the elbows to flare out during the push — keep them close to the body for consistent tricep loading.',
    ],
    variations: [
      {
        name: 'Rope Pushdown',
        purpose: 'The rope allows a neutral grip and a slightly wider finishing position that can increase the tricep squeeze.',
        formChange: 'Attach a rope. Grip both ends with neutral grip. At the bottom, spread the ends outward slightly.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Pushdown',
        purpose: 'Trains one arm at a time; useful for identifying and addressing left-right differences.',
        formChange: 'Use a single handle. Push down with one arm, keeping the same upper-arm-fixed technique.',
        difficulty: 'similar',
      },
      {
        name: 'Reverse-grip Pushdown',
        purpose: 'An underhand (supinated) grip changes the wrist position and slightly alters muscle emphasis.',
        formChange: 'Grip the bar or handle with palms facing up. Push downward in the same motion.',
        difficulty: 'similar',
      },
      {
        name: 'Close-grip Bench Press',
        purpose: 'A compound pressing alternative that trains the triceps with greater loading potential.',
        formChange: 'Lie on a flat bench. Use a slightly inside-shoulder-width grip and press with elbows close.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Elbow pain during pushdowns can sometimes be reduced by widening the grip slightly or switching from a straight bar to a rope.',
      'Avoid loading so heavy that the shoulders must swing to push the weight down.',
      'Do not force the elbows into a position that feels uncomfortable at the start or end of the range.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Overhead Tricep Extension ─────────────────────────────────────────────────
  'overhead-tricep-extension': {
    exerciseKey: 'overhead-tricep-extension',
    displayName: 'Overhead Tricep Extension',
    summary:
      'A tricep exercise performed with the arms overhead, placing the long head of the tricep ' +
      'in a stretched position before extending. It can be performed seated or standing with a ' +
      'dumbbell, cable, EZ-bar, or kettlebell.',
    setup: [
      'Hold a dumbbell (or cable rope / EZ-bar) overhead with both hands, or one hand for a unilateral version.',
      'For the two-handed dumbbell version: grip the inner plate with both hands, elbows pointing upward.',
      'Upper arms should be roughly vertical beside or slightly behind the head throughout the movement.',
      'Sit or stand — seated provides a more stable base; standing adds a balance and trunk-stability demand.',
      'Brace the core and keep the ribs down to prevent the lower back from arching excessively.',
    ],
    execution: [
      'Lower the weight behind your head by bending the elbows, keeping the upper arms as still as possible.',
      'Descend until you feel a comfortable tricep stretch — roughly when the forearms are parallel to the floor or slightly lower.',
      'Extend the elbows to return the weight overhead, squeezing the triceps at the top.',
      'Choose a depth that is comfortable for your shoulder and elbow — do not force depth if the position feels strained.',
      'Keep the elbows from flaring excessively wide during the movement.',
    ],
    breathing: [
      'Breathe in as you lower the weight behind your head.',
      'Breathe out as you extend back to overhead.',
      'Keep the core braced and breathe steadily throughout.',
    ],
    cues: [
      '"Upper arms stay vertical" — only the forearms should move; the upper arms are the anchor.',
      '"Ribs down" — prevents the lower back from arching to compensate for limited shoulder mobility.',
      '"Comfortable elbow position" — elbows can be slightly bent outward; do not force them together.',
      '"Squeeze at the top" — a brief hold at full extension reinforces the tricep contraction.',
    ],
    commonMistakes: [
      'Upper arms drifting forward — the elbows should stay beside or slightly behind the head throughout.',
      'Rib flare or lower-back arch — a common compensation for limited shoulder flexibility; keep the ribs neutral.',
      'Forcing the elbows together — elbows that are slightly apart is normal and less stressful on the joint.',
      'Using too heavy a load — the overhead position demands shoulder stability; start lighter than you expect.',
      'Partial range of motion at the bottom — descend until you feel the stretch; stopping early reduces the long-head stimulus.',
    ],
    variations: [
      {
        name: 'Single-arm Overhead Tricep Extension',
        purpose: 'One arm at a time; reveals left-right differences and allows more focus per side.',
        formChange: 'Hold a dumbbell in one hand overhead, opposite hand on your hip or supporting the working upper arm. Same lowering and extension.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Overhead Tricep Extension',
        purpose: 'Cable provides constant tension through the full range, including at the top where a dumbbell loses tension.',
        formChange: 'Set a cable at floor level behind you. Hold the rope overhead and extend against cable tension.',
        difficulty: 'similar',
      },
      {
        name: 'Seated Overhead Tricep Extension',
        purpose: 'Seated position reduces balance demand and keeps the focus on the triceps.',
        formChange: 'Sit on an upright bench. Perform the same two-handed or one-handed overhead extension.',
        difficulty: 'easier',
      },
      {
        name: 'Tricep Pushdown',
        purpose: 'A cable alternative that trains the triceps without the overhead shoulder demand.',
        formChange: 'Set a cable high. Push the handle downward from chest height to full elbow extension.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Shoulder flexibility affects how comfortable the overhead position feels — reduce the range of motion rather than forcing the arms fully vertical if the position is uncomfortable.',
      'Elbow discomfort at the bottom of the extension is a signal to reduce the range of motion or load.',
      'Do not force the elbows into a position that feels uncomfortable or unstable overhead.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Skull Crushers ────────────────────────────────────────────────────────────
  'skull-crushers': {
    exerciseKey: 'skull-crushers',
    displayName: 'Skull Crushers',
    summary:
      'A lying tricep extension using an EZ-bar, straight bar, or dumbbells, where the weight ' +
      'is lowered toward the forehead or just behind the head. It places the tricep under load ' +
      'through a long range of motion with the arms overhead.',
    setup: [
      'Lie on a flat bench and press the bar or dumbbells to a position above your chest, arms extended.',
      'An EZ-curl bar is commonly used because the angled grip can feel more comfortable on the wrists and elbows than a straight bar.',
      'Grip slightly inside shoulder width for a bar; hold dumbbells with a neutral or slightly angled grip.',
      'Upper arms should angle slightly past vertical — pointing a little toward your head — rather than straight up.',
      'Use a moderate load; this exercise places significant load on the elbow joint.',
    ],
    execution: [
      'Lower the weight by bending the elbows, keeping the upper arms at the same fixed angle throughout.',
      'A useful target is to lower toward the forehead, the top of the head, or just behind the head — experiment to find what feels most natural for your shoulder and elbow.',
      'Once you reach your comfortable depth, extend the elbows to return to the starting position.',
      'Avoid swinging the upper arms to generate momentum — the upper arm angle should remain stable throughout.',
      'Choose a range of motion that does not cause elbow discomfort.',
    ],
    breathing: [
      'Breathe in as you lower.',
      'Breathe out as you extend back up.',
      'Keep a light core brace throughout to stabilise the trunk.',
    ],
    cues: [
      '"Upper arms stay fixed" — only the forearms move; the upper arm angle should not change.',
      '"Lower to comfort" — forehead, crown, or slightly behind — choose what feels controlled.',
      '"Elbows don\'t flare" — keep the elbows tracking roughly parallel to each other rather than splaying wide.',
      '"Control the descent" — a slow, deliberate lowering phase is safer and more productive.',
    ],
    commonMistakes: [
      'Upper arms swinging — the upper arm should remain at the same angle; only the forearm moves.',
      'Elbow flaring wide — keeping the elbows closer together maintains consistent load on the tricep.',
      'Using too much weight — skull crushers under heavy load with poor elbow control can cause discomfort or injury over time.',
      'Lowering only partway — find your comfortable depth and use it consistently rather than cutting reps short arbitrarily.',
    ],
    variations: [
      {
        name: 'Dumbbell Skull Crushers',
        purpose: 'Each arm moves independently; can feel more comfortable on the wrists and elbows for some people.',
        formChange: 'Hold a dumbbell in each hand. Lower toward the temples or beside the head. Same fixed-upper-arm technique.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Skull Crusher',
        purpose: 'A cable from the floor or low pulley maintains tension at the top of the movement where a bar loses it.',
        formChange: 'Lie with your head toward a low cable. Pull the bar to the starting overhead position, then lower toward the forehead.',
        difficulty: 'similar',
      },
      {
        name: 'Overhead Tricep Extension',
        purpose: 'A seated or standing variation that stretches the long head of the tricep through a similar overhead range.',
        formChange: 'Hold a dumbbell overhead with both hands. Lower behind the head by bending the elbows.',
        difficulty: 'similar',
      },
      {
        name: 'Tricep Pushdown',
        purpose: 'A standing cable alternative that trains the triceps without the lying-down overhead position.',
        formChange: 'Set a cable high. Push the handle from chest height to full elbow extension.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Elbow discomfort during skull crushers is a signal to reduce the load, adjust the lowering target, or switch to a dumbbell variation.',
      'The exercise name is dramatic; use a weight and range of motion that you can control precisely — do not overload this movement.',
      'Always use a rack or have a spotter available when using a barbell.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Curl ───────────────────────────────────────────────────────────
  'kettlebell-curl': {
    exerciseKey: 'kettlebell-curl',
    displayName: 'Kettlebell Curl',
    summary:
      'A bicep curl using a kettlebell, where the offset weight distribution means the bell ' +
      'shifts as it is curled. This requires slightly more wrist and grip stability than a ' +
      'dumbbell curl and can make lighter loads feel more demanding.',
    setup: [
      'Stand with feet hip-width apart, holding a kettlebell by the handle in one or both hands.',
      'Grip the handle firmly — the bell will try to rotate as you curl it; maintain a controlled wrist position.',
      'Let the arm hang at full extension, kettlebell resting below the hand.',
      'Keep the upper arm close to the side of the torso throughout.',
      'Start with a lighter load than your usual dumbbell curl until you are familiar with the shifting bell weight.',
    ],
    execution: [
      'Curl the kettlebell upward by bending the elbow, keeping the upper arm fixed.',
      'The bell will naturally shift as you curl — control this movement rather than letting it swing freely.',
      'Continue until the forearm is roughly vertical or the bicep is fully shortened.',
      'Lower under control back to full extension.',
      'Avoid swinging the torso to assist the curl — use a weight that allows a strict arm movement.',
    ],
    breathing: [
      'Breathe out as you curl up.',
      'Breathe in as you lower.',
      'Keep breathing steadily across the set.',
    ],
    cues: [
      '"Control the bell shift" — the kettlebell\'s offset weight is what makes this different from a dumbbell curl.',
      '"Upper arm stays still" — only the forearm moves; the elbow is the pivot.',
      '"Firm wrist" — a controlled wrist position keeps the bell from swinging unpredictably.',
      '"Full extension at the bottom" — lower fully between reps for a complete range of motion.',
    ],
    commonMistakes: [
      'Using a load that causes the bell to swing uncontrollably — start lighter and build familiarity with the shifting weight.',
      'Wrist bending backward under the bell weight — maintain a firm, relatively neutral wrist throughout.',
      'Torso swinging to assist the curl — reduce the load if this occurs.',
      'Rushing the descent — control the lowering just as deliberately as the lift.',
    ],
    variations: [
      {
        name: 'Alternating Kettlebell Curl',
        purpose: 'Trains one arm at a time, giving each side full attention between reps.',
        formChange: 'Curl one kettlebell at a time, lowering fully before curling the other side.',
        difficulty: 'similar',
      },
      {
        name: 'Two-hand Kettlebell Curl',
        purpose: 'Both arms curl simultaneously; heavier effective load than a single bell.',
        formChange: 'Hold one kettlebell by the horns (both hands gripping the sides of the handle). Curl upward with both hands.',
        difficulty: 'similar',
      },
      {
        name: 'Dumbbell Curl',
        purpose: 'A more stable implement if the kettlebell\'s shifting weight is uncomfortable or unfamiliar.',
        formChange: 'Hold a dumbbell instead of a kettlebell. The weight is centred under the grip throughout the curl.',
        difficulty: 'easier',
      },
      {
        name: 'Slow-eccentric Kettlebell Curl',
        purpose: 'A four-to-five second lowering phase increases time under tension and muscle demand.',
        formChange: 'Curl upward at normal pace, then lower very slowly over four to five seconds.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'The shifting weight of the kettlebell places more demand on wrist control — use a lighter starting weight than you expect.',
      'Wrist or forearm discomfort during kettlebell curls is a signal to reduce the load or switch to dumbbells.',
      'Do not force the elbow into a position that feels uncomfortable at any point in the range.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Tricep Extension ───────────────────────────────────────────────
  'kettlebell-tricep-extension': {
    exerciseKey: 'kettlebell-tricep-extension',
    displayName: 'Kettlebell Tricep Extension',
    summary:
      'An overhead tricep extension using a kettlebell held by the horns or the base. ' +
      'The grip on the horns creates a comfortable two-hand hold, and the hanging bell ' +
      'requires slightly more wrist and grip awareness than a dumbbell.',
    setup: [
      'Sit or stand and hold the kettlebell by the horns (sides of the handle) with both hands, bell hanging downward.',
      'Press or lift the bell to an overhead position, arms extended, elbows pointing upward.',
      'Upper arms remain roughly vertical beside or slightly behind the head throughout.',
      'Core braced, ribs down to prevent excessive lower-back arch.',
      'Start with a lighter kettlebell than you expect — the overhead position and bell-weight shifting demand extra control.',
    ],
    execution: [
      'Lower the kettlebell behind your head by bending the elbows, keeping the upper arms stationary.',
      'Descend until you feel a comfortable tricep stretch, then extend the elbows to return overhead.',
      'Choose a depth that feels comfortable for your shoulder and elbow — do not force the bell further than is stable.',
      'Avoid letting the bell swing or tilt — maintain a firm grip on the horns throughout.',
      'Lower and raise at a controlled, deliberate pace.',
    ],
    breathing: [
      'Breathe in as you lower behind the head.',
      'Breathe out as you extend back overhead.',
      'Keep the core braced and breathe steadily throughout.',
    ],
    cues: [
      '"Upper arms stay vertical" — only the forearms move; the elbows are the pivot.',
      '"Grip the horns firmly" — a secure grip prevents the bell from tipping or swinging.',
      '"Ribs down" — prevents lower-back arch as the weight travels overhead.',
      '"Comfortable depth" — find the depth where you feel the stretch without shoulder or elbow strain.',
    ],
    commonMistakes: [
      'Upper arms drifting forward — the elbows should stay beside or slightly behind the head throughout.',
      'Bell tilting or swinging — a firm grip on both horns keeps the bell stable.',
      'Forcing range of motion that the shoulder does not comfortably allow — reduce depth rather than forcing the overhead position.',
      'Too heavy a load — the overhead position with a kettlebell demands significant control; start conservatively.',
    ],
    variations: [
      {
        name: 'Dumbbell Overhead Tricep Extension',
        purpose: 'A more stable implement if the kettlebell\'s bell-shifting weight is unfamiliar.',
        formChange: 'Hold one dumbbell with both hands by the inner plate overhead. Lower behind the head and extend.',
        difficulty: 'easier',
      },
      {
        name: 'Single-arm Kettlebell Tricep Extension',
        purpose: 'One arm at a time; trains left-right differences and may feel more stable than the two-hand version for some.',
        formChange: 'Hold the kettlebell handle in one hand overhead. Lower behind the head and extend. Repeat on the other side.',
        difficulty: 'similar',
      },
      {
        name: 'Cable Overhead Tricep Extension',
        purpose: 'Cable provides continuous tension including at the top where a kettlebell has minimal load.',
        formChange: 'Set a cable low behind you. Hold the rope overhead and extend against the cable tension.',
        difficulty: 'similar',
      },
      {
        name: 'Tricep Pushdown',
        purpose: 'A standing cable alternative that removes the overhead shoulder demand entirely.',
        formChange: 'Set a cable high. Push the handle downward from chest height to full elbow extension.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'The overhead position places demand on shoulder flexibility — reduce the range of motion rather than forcing the arms fully vertical if it is uncomfortable.',
      'Elbow discomfort at the bottom of the extension is a signal to reduce depth or load.',
      'Do not force a wrist or elbow position that feels uncomfortable — adjust the grip or switch implements.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Hammer Curl ────────────────────────────────────────────────────
  'kettlebell-hammer-curl': {
    exerciseKey: 'kettlebell-hammer-curl',
    displayName: 'Kettlebell Hammer Curl',
    summary:
      'A bicep curl performed with the kettlebell handle gripped in a neutral (thumbs-up) position ' +
      'throughout, similar to a dumbbell hammer curl. The offset weight of the kettlebell adds a ' +
      'wrist and grip stability challenge compared to a dumbbell.',
    setup: [
      'Stand with feet hip-width apart, holding a kettlebell by the handle in one hand, thumb pointing upward.',
      'The neutral grip is maintained throughout the entire movement — the wrist does not rotate during the curl.',
      'Let the arm hang at full extension with the bell below the hand at the start.',
      'Keep the upper arm close to the side of the torso throughout.',
      'Start lighter than your usual dumbbell hammer curl — the kettlebell\'s offset weight adds a stability demand.',
    ],
    execution: [
      'Curl the kettlebell upward by bending the elbow, maintaining the neutral grip throughout.',
      'Keep the upper arm stationary — only the forearm moves.',
      'Continue until the forearm is roughly vertical or the arm is fully flexed.',
      'Lower under control back to full arm extension, maintaining the neutral wrist throughout.',
      'Avoid swinging the torso or shoulder to help complete the rep.',
    ],
    breathing: [
      'Breathe out as you curl up.',
      'Breathe in as you lower.',
      'Keep breathing steadily across the set.',
    ],
    cues: [
      '"Thumbs up throughout" — the neutral grip does not rotate at any point in the movement.',
      '"Control the bell" — the shifting weight of the kettlebell requires deliberate wrist stability.',
      '"Upper arm stays still" — the elbow is the pivot; the shoulder does not assist.',
      '"Full extension at the bottom" — lower completely between reps for the full range of motion.',
    ],
    commonMistakes: [
      'Rotating the wrist toward supination during the curl — a hammer curl maintains neutral grip from start to finish.',
      'Bell swinging due to insufficient wrist control — reduce the load and focus on stabilising the grip.',
      'Swinging the torso — use a load that allows strict elbow-driven curling.',
      'Shortening the range at the bottom — lower to a complete extension for the full bicep and brachialis stretch.',
    ],
    variations: [
      {
        name: 'Dumbbell Hammer Curl',
        purpose: 'A more stable neutral-grip curl if the kettlebell\'s offset weight is difficult to control.',
        formChange: 'Hold a dumbbell in neutral grip. Curl with the thumbs-up position maintained throughout.',
        difficulty: 'easier',
      },
      {
        name: 'Alternating Kettlebell Hammer Curl',
        purpose: 'One arm at a time; each side gets full attention and a brief rest between reps.',
        formChange: 'Curl one kettlebell at a time in neutral grip, lowering fully before the other side curls.',
        difficulty: 'similar',
      },
      {
        name: 'Two-hand Kettlebell Hammer Curl',
        purpose: 'Both arms curl simultaneously; increases effective load and symmetry demand.',
        formChange: 'Hold a kettlebell in each hand in neutral grip. Curl both simultaneously.',
        difficulty: 'similar',
      },
      {
        name: 'Slow-eccentric Kettlebell Hammer Curl',
        purpose: 'A deliberate four-to-five second lowering phase increases time under tension.',
        formChange: 'Curl upward at a normal pace, then lower very slowly over four to five seconds.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'The offset weight of the kettlebell demands more wrist and grip stability than a dumbbell — start lighter than expected.',
      'Wrist or forearm discomfort is a signal to reduce the load or switch to a dumbbell hammer curl.',
      'Do not force the elbow into a position that feels uncomfortable at any point in the range.',
      'This content is coaching guidance, not medical or clinical advice. Stop or modify any movement that causes sharp pain, numbness, dizziness, or other concerning symptoms, and consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── LEGS ──────────────────────────────────────────────────────────────────────

  // ── Front Squat ───────────────────────────────────────────────────────────────
  'front-squat': {
    exerciseKey: 'front-squat',
    displayName: 'Front Squat',
    summary: 'A squat variation with the barbell held across the front of the shoulders, requiring an upright torso and strong upper-back position. It places relatively more emphasis on the quads and demands good thoracic mobility.',
    setup: [
      'Set the bar at upper-chest height in a rack.',
      'Step under the bar and position it across the front of the shoulders — a front-rack grip (elbows high, fingertips or full hand under the bar) is common. A cross-arm grip or wrist-strap alternative can work if the front rack is uncomfortable.',
      'Brace your core and unrack the bar, stepping back with control.',
      'A useful starting stance is roughly shoulder-width with toes turned slightly out — adjust to your hip mobility.',
    ],
    execution: [
      'Keep the elbows high and chest tall throughout the descent.',
      'Inhale and brace, then initiate the squat by sitting the hips back and down.',
      'Choose a depth you can reach while keeping the torso upright and the lower back neutral.',
      'Drive evenly through the feet to return to standing, keeping the elbows up as you rise.',
      'Exhale at or near the top.',
    ],
    breathing: ['Inhale and brace before descending. Exhale after passing the sticking point on the way up, or at the top.'],
    cues: [
      '"Elbows up and forward."',
      '"Keep the chest tall."',
      '"Brace before you descend."',
      '"Drive the floor away."',
    ],
    commonMistakes: [
      'Letting the elbows drop, which rounds the upper back and shifts the bar forward.',
      'Losing the brace at the bottom, causing the lower back to round.',
      'Forcing depth beyond what your mobility currently allows.',
      'Looking sharply up or down — a neutral gaze tends to support a neutral spine.',
    ],
    variations: [
      {
        name: 'Goblet Squat',
        purpose: 'A useful regression that teaches the upright-torso squat pattern with a dumbbell or kettlebell held at the chest.',
        formChange: 'Hold a dumbbell or kettlebell at chest height with both hands instead of using a barbell.',
        difficulty: 'easier',
      },
      {
        name: 'Cross-arm Front Squat',
        purpose: 'Removes wrist and shoulder mobility demands while keeping the front-loaded pattern.',
        formChange: 'Cross the arms over the bar with hands resting on the opposite shoulder to hold it in place.',
        difficulty: 'similar',
      },
      {
        name: 'Paused Front Squat',
        purpose: 'Increases time under tension and reinforces position at the bottom.',
        formChange: 'Pause for 2–3 seconds at the bottom before driving back up.',
        difficulty: 'harder',
      },
      {
        name: 'Front Squat with Wrist Straps',
        purpose: 'Allows a front-rack-like position for those with limited wrist mobility.',
        formChange: 'Loop wrist straps around the bar and hold them while keeping the elbows high.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Use a load and depth you can control with an upright torso — excessive forward lean with heavy loads increases spinal stress.',
      'If the wrists or shoulders are uncomfortable in the front rack, try the cross-arm or strap alternative before progressing load.',
      'Use collars and a spotter or safety bars when working with heavier loads.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Leg Press ─────────────────────────────────────────────────────────────────
  'leg-press': {
    exerciseKey: 'leg-press',
    displayName: 'Leg Press',
    summary: 'A machine exercise that loads the quads, glutes, and hamstrings in a stable, seated position. Foot placement influences which muscles are relatively more emphasised.',
    setup: [
      'Adjust the seat and back pad so that when the feet are on the platform, the knees are bent to a comfortable starting angle — typically around 90 degrees, but adjust for your proportions.',
      'Place the feet roughly hip- to shoulder-width on the platform. Higher placements tend to increase glute and hamstring contribution; lower placements emphasise the quads more.',
      'Disengage the safety handles before beginning the movement.',
    ],
    execution: [
      'Inhale and brace, then lower the platform toward you in a controlled manner.',
      'Stop at a depth where the lower back remains in contact with the pad — avoid letting the pelvis tuck under.',
      'Drive evenly through the feet to extend the legs.',
      'Avoid forcefully locking out the knees at the top — stop just short of full extension to keep tension on the muscles.',
      'Exhale as you press.',
    ],
    breathing: ['Inhale before lowering. Exhale as you press the platform away.'],
    cues: [
      '"Keep the lower back against the pad."',
      '"Drive through the whole foot."',
      '"Control the descent — don\'t let it drop."',
    ],
    commonMistakes: [
      'Allowing the pelvis to lose contact with the pad at the bottom, which can stress the lower back.',
      'Letting the knees cave inward — guide them to track over the toes.',
      'Using a range of motion that causes the back to round.',
      'Snapping or forcefully locking out the knees.',
    ],
    variations: [
      {
        name: 'Single-leg Press',
        purpose: 'Addresses side-to-side strength differences and increases the demand per leg.',
        formChange: 'Place one foot on the platform and keep the other off. Use a lighter load.',
        difficulty: 'harder',
      },
      {
        name: 'High-foot Leg Press',
        purpose: 'Shifts relatively more emphasis to the glutes and hamstrings.',
        formChange: 'Place the feet higher on the platform while keeping the same controlled range.',
        difficulty: 'similar',
      },
      {
        name: 'Reduced-load Leg Press',
        purpose: 'Useful for learning the movement pattern or returning after a break.',
        formChange: 'Use a lighter load and focus on controlled movement through the full comfortable range.',
        difficulty: 'easier',
      },
      {
        name: 'Slow-tempo Leg Press',
        purpose: 'Increases time under tension and reduces momentum.',
        formChange: 'Lower for 3–4 seconds and press for 2 seconds.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Always re-engage the safety handles before leaving the machine.',
      'Choose a range of motion that keeps your lower back in contact with the pad.',
      'Avoid loading the machine so heavily that you cannot control the descent.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Leg Extension ─────────────────────────────────────────────────────────────
  'leg-extension': {
    exerciseKey: 'leg-extension',
    displayName: 'Leg Extension',
    summary: 'An isolation machine exercise for the quadriceps. The seated position and lever arm provide direct loading of the quads through knee extension.',
    setup: [
      'Sit with the back against the pad and adjust the seat so the knees align with the machine\'s pivot point.',
      'Position the shin pad against the lower shins, just above the ankles — not on the foot or too high on the shin.',
      'Grip the handles or sides of the seat lightly for stability.',
    ],
    execution: [
      'Inhale and brace lightly, then extend the knees to raise the pad in a controlled arc.',
      'Choose a range of motion that feels comfortable — full extension is common but not mandatory if it causes discomfort.',
      'Pause briefly at the top if useful, then lower the pad in a controlled manner.',
      'Avoid swinging or using momentum to lift the weight.',
      'Exhale as you extend.',
    ],
    breathing: ['Exhale as you extend. Inhale as you lower.'],
    cues: [
      '"Control the movement — especially the lowering phase."',
      '"Keep the back against the pad."',
      '"No swinging — let the quads do the work."',
    ],
    commonMistakes: [
      'Using momentum or jerking the weight up instead of a smooth extension.',
      'Allowing the hips to lift off the seat.',
      'Placing the shin pad too high, which shifts stress to the knee joint.',
      'Lowering too quickly and losing the eccentric benefit.',
    ],
    variations: [
      {
        name: 'Single-leg Extension',
        purpose: 'Addresses side-to-side differences and reduces total load per session.',
        formChange: 'Extend one leg at a time with a lighter load.',
        difficulty: 'similar',
      },
      {
        name: 'Slow-tempo Extension',
        purpose: 'Increases time under tension and reduces the temptation to use momentum.',
        formChange: 'Extend over 2 seconds, pause at the top, lower over 3–4 seconds.',
        difficulty: 'harder',
      },
      {
        name: 'Partial-range Extension',
        purpose: 'Useful if full extension is uncomfortable at the top of the range.',
        formChange: 'Extend to a comfortable end point rather than forcing full knee extension.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Choose a range of motion you can control comfortably — individuals vary in how full extension feels.',
      'If this exercise consistently causes knee discomfort, adjust the shin-pad position, reduce the load, or consult a professional.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Leg Curl ──────────────────────────────────────────────────────────────────
  'leg-curl': {
    exerciseKey: 'leg-curl',
    displayName: 'Leg Curl',
    summary: 'A machine exercise targeting the hamstrings through knee flexion. Available in lying, seated, and standing variations; each places the hamstrings in a slightly different position.',
    setup: [
      'For a lying leg curl: lie face down with the pad positioned against the lower leg, just above the ankles. Align the knees with the machine\'s pivot point.',
      'For a seated leg curl: sit upright with the pad against the lower shins and thighs under the upper pad.',
      'Grip the handles to stabilise the upper body.',
    ],
    execution: [
      'Inhale and brace, then curl the lower leg toward the glutes in a controlled arc.',
      'Pause briefly at the top of the curl.',
      'Lower with control — do not let the weight drop.',
      'Avoid lifting the hips (lying) or excessive momentum to complete the rep.',
      'Exhale as you curl.',
    ],
    breathing: ['Exhale as you curl. Inhale as you lower.'],
    cues: [
      '"Control the return — don\'t let it slam."',
      '"Keep the hips down on the pad."',
      '"Curl through the full range you can comfortably reach."',
    ],
    commonMistakes: [
      'Letting the hips lift off the pad to assist the movement (lying variation).',
      'Using momentum or swinging to initiate the curl.',
      'Lowering too quickly, losing the eccentric stimulus.',
      'Pad positioned too far up the shin, creating an uncomfortable lever.',
    ],
    variations: [
      {
        name: 'Seated Leg Curl',
        purpose: 'Trains the hamstrings in a more lengthened position, which may produce a different stimulus.',
        formChange: 'Use a seated leg-curl machine rather than a lying one.',
        difficulty: 'similar',
      },
      {
        name: 'Single-leg Curl',
        purpose: 'Addresses left-right differences and reduces total load.',
        formChange: 'Curl one leg at a time with a lighter load.',
        difficulty: 'similar',
      },
      {
        name: 'Slow-tempo Curl',
        purpose: 'Increases time under tension and reduces momentum.',
        formChange: 'Curl for 2 seconds, pause at the top, lower for 3–4 seconds.',
        difficulty: 'harder',
      },
      {
        name: 'Partial-range Curl',
        purpose: 'Useful when the full range of motion is restricted by flexibility or comfort.',
        formChange: 'Curl to the comfortable end point rather than forcing full range.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Choose a load and range of motion you can control without lifting the hips or using momentum.',
      'If the knee or the back of the thigh is consistently uncomfortable, check pad placement and load.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Romanian Deadlift ─────────────────────────────────────────────────────────
  'romanian-deadlift': {
    exerciseKey: 'romanian-deadlift',
    displayName: 'Romanian Deadlift',
    summary: 'A hip-hinge movement that trains the hamstrings and glutes through a controlled lowering and return. The knees stay softly bent throughout, and the bar stays close to the legs.',
    setup: [
      'Stand with the bar (or dumbbells) at hip height. Use a hip-width stance.',
      'Hold the bar with a double-overhand grip just outside the legs.',
      'Set the shoulders back and down, brace the core, and establish a neutral spine before moving.',
    ],
    execution: [
      'Initiate by pushing the hips back — not by bending the knees.',
      'Let the bar travel close to the legs as you hinge, keeping the back straight.',
      'Lower until you feel a comfortable stretch in the hamstrings, or until the lower back begins to round — whichever comes first.',
      'Drive the hips forward to return to standing, squeezing the glutes at the top.',
      'Exhale as you stand.',
    ],
    breathing: ['Inhale and brace before hinging. Exhale as you return to standing.'],
    cues: [
      '"Push the hips back — don\'t squat down."',
      '"Keep the bar close — it should almost brush the legs."',
      '"Feel the hamstrings load — don\'t chase depth."',
      '"Drive the hips through to finish."',
    ],
    commonMistakes: [
      'Squatting instead of hinging — the knees should not bend significantly.',
      'Letting the bar drift away from the legs, increasing lower-back stress.',
      'Rounding the lower back to reach greater depth.',
      'Hyperextending at the top instead of a neutral hip position.',
    ],
    variations: [
      {
        name: 'Dumbbell Romanian Deadlift',
        purpose: 'A useful starting point — easier to keep the load close and adjust positioning.',
        formChange: 'Use dumbbells instead of a barbell, holding one in each hand.',
        difficulty: 'easier',
      },
      {
        name: 'Single-leg Romanian Deadlift',
        purpose: 'Increases balance demand and addresses side-to-side differences.',
        formChange: 'Hinge on one leg, allowing the other to extend back for counterbalance. Use a lighter load.',
        difficulty: 'harder',
      },
      {
        name: 'Kettlebell Romanian Deadlift',
        purpose: 'Portable variation with similar mechanics.',
        formChange: 'Hold a kettlebell in each hand and hinge as normal.',
        difficulty: 'similar',
      },
      {
        name: 'Stiff-leg Deadlift',
        purpose: 'Emphasises the hamstrings through a greater range by allowing more knee extension.',
        formChange: 'Straighten the knees more than in a standard RDL — only go as far as comfortable.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Do not force depth beyond what your hamstring flexibility and lower-back control allow.',
      'Keep the load close to the body — a drifting bar multiplies stress on the lower back.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Lunges ────────────────────────────────────────────────────────────────────
  'lunges': {
    exerciseKey: 'lunges',
    displayName: 'Lunges',
    summary: 'A single-leg step pattern that trains the quads, glutes, and hamstrings while challenging balance and hip stability. Forward, reverse, and walking variations each place slightly different demands on the body.',
    setup: [
      'Stand tall with feet hip-width apart.',
      'Bodyweight lunges require no equipment. For loaded lunges, hold dumbbells at the sides, a barbell on the back, or a kettlebell in a goblet or rack position.',
    ],
    execution: [
      'Step forward (or back for a reverse lunge) to a length where the front foot is flat and the torso stays upright.',
      'Lower the rear knee toward the floor in a controlled manner — a comfortable range is one where the front shin is roughly vertical or angled slightly forward.',
      'Press through the front foot to return to the starting position.',
      'Guide the front knee to track over the toes — avoid it collapsing inward.',
      'Exhale as you press back to standing.',
    ],
    breathing: ['Inhale as you step and lower. Exhale as you return.'],
    cues: [
      '"Step to a length that feels stable before you lower."',
      '"Keep the torso upright — don\'t lean forward excessively."',
      '"Drive through the front foot."',
      '"Guide the knee over the toes."',
    ],
    commonMistakes: [
      'Step too short or too long, making balance and knee position difficult.',
      'Letting the front knee collapse inward.',
      'Leaning excessively forward with the torso.',
      'Dropping the rear knee to the floor instead of stopping just above it.',
    ],
    variations: [
      {
        name: 'Reverse Lunge',
        purpose: 'Reduces shear force on the front knee and is often easier to balance for beginners.',
        formChange: 'Step backward instead of forward.',
        difficulty: 'easier',
      },
      {
        name: 'Walking Lunge',
        purpose: 'Adds a continuous movement pattern and increases overall volume.',
        formChange: 'Step forward with one foot, descend, then bring the other foot forward into the next step rather than returning to start.',
        difficulty: 'similar',
      },
      {
        name: 'Supported Lunge',
        purpose: 'Reduces balance demand, useful when learning the movement.',
        formChange: 'Hold a wall or rack with one hand for support while performing the lunge.',
        difficulty: 'easier',
      },
      {
        name: 'Loaded Forward Lunge',
        purpose: 'Increases total load on the legs and upper body.',
        formChange: 'Hold dumbbells or a barbell while performing forward lunges.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Choose a step length and range of motion you can control with a stable knee and upright torso.',
      'If knee discomfort is consistent, try the reverse lunge variation and reduce the range of motion.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Bulgarian Split Squat ─────────────────────────────────────────────────────
  'bulgarian-split-squat': {
    exerciseKey: 'bulgarian-split-squat',
    displayName: 'Bulgarian Split Squat',
    summary: 'A single-leg squat with the rear foot elevated on a bench or box. It places relatively more emphasis on the front leg and challenges balance, hip flexibility, and quad and glute strength.',
    setup: [
      'Stand roughly 2–3 feet in front of a bench, box, or elevated surface.',
      'Place the top of one foot (or the shin) on the surface behind you — adjust the distance until the front knee tracks comfortably when you descend.',
      'A useful starting position is to find the distance that keeps the front shin roughly vertical at the bottom.',
    ],
    execution: [
      'Hold the torso upright or with a slight forward lean, depending on your goal and mobility.',
      'Inhale and brace, then lower the rear knee toward the floor in a controlled manner.',
      'Stop at a depth you can reach while maintaining balance and a neutral spine.',
      'Drive through the front foot to return to the top position.',
      'Exhale as you drive up.',
    ],
    breathing: ['Inhale before descending. Exhale as you drive back up.'],
    cues: [
      '"The front leg does the work — the rear leg is just for balance."',
      '"Control the descent — don\'t let your hips drop suddenly."',
      '"Keep the torso stable throughout."',
    ],
    commonMistakes: [
      'Front foot too close to the bench, causing the knee to travel far forward.',
      'Front foot too far, causing a pronounced forward lean.',
      'Letting the front knee collapse inward.',
      'Forcing the rear leg into a deep stretch before the movement is controlled.',
    ],
    variations: [
      {
        name: 'Supported Bulgarian Split Squat',
        purpose: 'Reduces balance demand while learning the movement.',
        formChange: 'Hold a rack or wall with one hand for additional stability.',
        difficulty: 'easier',
      },
      {
        name: 'Reduced-range Bulgarian Split Squat',
        purpose: 'Useful when hip flexor tightness or balance limits comfortable depth.',
        formChange: 'Lower only partway and gradually increase range over time.',
        difficulty: 'easier',
      },
      {
        name: 'Dumbbell Bulgarian Split Squat',
        purpose: 'Adds external load to increase strength stimulus.',
        formChange: 'Hold dumbbells at the sides while performing the movement.',
        difficulty: 'harder',
      },
      {
        name: 'Barbell Bulgarian Split Squat',
        purpose: 'Higher-load variation for more advanced trainees.',
        formChange: 'Hold a barbell on the upper back instead of dumbbells.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Use a rear-foot height and depth that allows comfortable balance and hip position — a very high surface can force the hip flexor into a stretched range that is uncomfortable.',
      'Avoid aggressively loading this exercise until the movement pattern is stable.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Calf Raises ───────────────────────────────────────────────────────────────
  'calf-raises': {
    exerciseKey: 'calf-raises',
    displayName: 'Calf Raises',
    summary: 'A focused ankle plantarflexion exercise targeting the gastrocnemius and soleus. Performed standing or seated, with or without load, across a range of surfaces.',
    setup: [
      'A useful starting position is to stand with the balls of the feet on the edge of a step or a raised surface, or flat on the floor.',
      'Stand tall with feet hip-width or slightly closer. Hold a support lightly for balance if needed.',
      'For loaded variations, hold dumbbells at the sides or use a calf-raise machine.',
    ],
    execution: [
      'Inhale, then rise onto the balls of the feet through a controlled range.',
      'Pause briefly at the top if useful — this can increase the stimulus at the peak contraction.',
      'Lower the heels back down in a controlled manner, allowing a stretch at the bottom if on an elevated surface.',
      'Avoid bouncing at the bottom.',
      'Exhale as you rise.',
    ],
    breathing: ['Exhale as you rise. Inhale as you lower.'],
    cues: [
      '"Rise through the full range you can control."',
      '"Pause at the top."',
      '"Lower slowly — don\'t let the heel drop."',
    ],
    commonMistakes: [
      'Bouncing at the bottom instead of controlling the eccentric.',
      'Not rising through a full controllable range.',
      'Leaning forward or gripping support too tightly to assist the lift.',
    ],
    variations: [
      {
        name: 'Seated Calf Raise',
        purpose: 'Shifts relatively more emphasis to the soleus by training with the knee bent.',
        formChange: 'Sit on a bench with feet flat or on a raised surface and perform the raise from a seated position.',
        difficulty: 'similar',
      },
      {
        name: 'Single-leg Calf Raise',
        purpose: 'Increases the demand per leg and addresses side-to-side differences.',
        formChange: 'Perform on one foot at a time, holding support for balance.',
        difficulty: 'harder',
      },
      {
        name: 'Supported Calf Raise',
        purpose: 'Useful when balance limits the movement or as a starting point.',
        formChange: 'Perform with both hands on a wall or rail for full balance support.',
        difficulty: 'easier',
      },
      {
        name: 'Machine Calf Raise',
        purpose: 'Allows heavier loading with back support.',
        formChange: 'Use a standing or donkey calf-raise machine with the appropriate pad placement.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Achilles or ankle discomfort is a signal to reduce the depth of the lowering phase or the load.',
      'Avoid excessive ballistic bouncing at the bottom of the range.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Leg Abduction ─────────────────────────────────────────────────────────────
  'leg-abduction': {
    exerciseKey: 'leg-abduction',
    displayName: 'Leg Abduction',
    summary: 'An exercise targeting the hip abductors — primarily the glute medius — through controlled outward movement of the leg. Can be performed on a machine, with a resistance band, standing, or lying on the side.',
    setup: [
      'Machine: sit with the outer thighs against the pads. Adjust the starting angle to a comfortable position.',
      'Side-lying: lie on one side with the body in a straight line, lower arm supporting the head.',
      'Standing with band: loop a band around both ankles or above the knees and stand beside a support.',
    ],
    execution: [
      'Brace lightly and keep the pelvis stable throughout the movement.',
      'Move the leg outward through a range of motion you can control without the pelvis tilting or the trunk leaning.',
      'Pause briefly at the end of the range, then return with control.',
      'Avoid using trunk lean or hip hiking to increase the range.',
      'Exhale as you abduct.',
    ],
    breathing: ['Exhale as you move the leg outward. Inhale as you return.'],
    cues: [
      '"Keep the pelvis level."',
      '"Control the return — don\'t let the leg drop."',
      '"The movement comes from the hip, not the waist."',
    ],
    commonMistakes: [
      'Tilting the trunk sideways to increase apparent range of motion.',
      'Letting the pelvis rotate or hike on the working side.',
      'Using momentum rather than a controlled contraction.',
      'Placing the band too low on the ankle when more proximal placement is more appropriate for the goal.',
    ],
    variations: [
      {
        name: 'Standing Band Abduction',
        purpose: 'A portable, accessible variation requiring only a resistance band.',
        formChange: 'Loop a band around the ankles and lift one leg out to the side while standing beside a support.',
        difficulty: 'easier',
      },
      {
        name: 'Side-lying Abduction',
        purpose: 'Reduces the balance demand and isolates the hip abductors.',
        formChange: 'Lie on one side and lift the top leg to a comfortable height, keeping the body aligned.',
        difficulty: 'easier',
      },
      {
        name: 'Machine Hip Abduction',
        purpose: 'Allows progressive loading with controlled resistance.',
        formChange: 'Use a seated abduction machine and press the pads outward through the comfortable range.',
        difficulty: 'similar',
      },
      {
        name: 'Clamshell',
        purpose: 'A low-load variation that can be performed with a band and targets the hip abductors in a different plane.',
        formChange: 'Lie on the side with knees bent and rotate the top knee upward like a clamshell, keeping the feet together.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Keep the pelvis stable — avoid compensating with trunk lean to achieve a wider range.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Goblet Squat ────────────────────────────────────────────────────
  'kettlebell-goblet-squat': {
    exerciseKey: 'kettlebell-goblet-squat',
    displayName: 'Kettlebell Goblet Squat',
    summary: 'A front-loaded squat holding a kettlebell at the chest. The counterbalance supports an upright torso and makes it a useful teaching tool and a standalone leg exercise.',
    setup: [
      'Hold the kettlebell by the horns (the handles on either side of the bell) at chest height, close to the sternum.',
      'Stand with feet roughly shoulder-width and toes turned slightly out — adjust to your hip mobility.',
      'Brace the core before descending.',
    ],
    execution: [
      'Inhale and brace, then sit the hips back and down between the knees.',
      'Keep the chest tall and the elbows inside or slightly inside the knees at the bottom.',
      'Choose a depth you can reach while keeping the heels down and the torso upright.',
      'Drive through the feet to return to standing.',
      'Exhale at or near the top.',
    ],
    breathing: ['Inhale and brace before descending. Exhale as you drive back up.'],
    cues: [
      '"Keep the kettlebell close to the chest."',
      '"Sit down between the heels — not just back."',
      '"Chest tall throughout."',
    ],
    commonMistakes: [
      'Letting the kettlebell drift away from the chest, which shifts load forward.',
      'Heels rising off the floor.',
      'Forcing depth beyond what mobility allows.',
      'Elbows flaring wide rather than staying near or inside the knees.',
    ],
    variations: [
      {
        name: 'Box Goblet Squat',
        purpose: 'Provides a depth target and reduces the fear of going too deep.',
        formChange: 'Place a box or bench behind you and lower until you lightly touch it before standing.',
        difficulty: 'easier',
      },
      {
        name: 'Paused Goblet Squat',
        purpose: 'Increases time under tension and reinforces the bottom position.',
        formChange: 'Pause for 2–3 seconds at the bottom before standing.',
        difficulty: 'harder',
      },
      {
        name: 'Tempo Goblet Squat',
        purpose: 'Builds control and reduces momentum.',
        formChange: 'Lower for 3–4 seconds, then drive up in 1–2 seconds.',
        difficulty: 'similar',
      },
      {
        name: 'Heels-elevated Goblet Squat',
        purpose: 'Reduces ankle mobility demand and can increase quad emphasis.',
        formChange: 'Place small plates or a wedge under the heels.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Choose a load you can hold comfortably at chest height for the full set — grip fatigue should not compromise control.',
      'Adjust depth and stance to suit your hip mobility and comfort.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Swing ──────────────────────────────────────────────────────────
  'kettlebell-swing': {
    exerciseKey: 'kettlebell-swing',
    displayName: 'Kettlebell Swing',
    summary: 'A ballistic hip-hinge movement driving a kettlebell from between the legs to roughly chest or eye height. Power comes from the hips and glutes, not from the shoulders or arms. A foundational kettlebell exercise with high demands on hip-hinge technique.',
    setup: [
      'Place the kettlebell on the floor a few inches in front of you.',
      'Stand with feet shoulder-width or slightly wider, toes slightly out.',
      'Hinge at the hips to reach the handle — keep the back flat and shoulders over or slightly in front of the bell.',
      'Take a firm grip with both hands.',
    ],
    execution: [
      'Hike the bell back between the legs with a hinge — not a squat.',
      'At the back of the hike, feel the hamstrings load, then drive the hips forward explosively.',
      'Let the hip extension propel the bell forward and upward — the arms guide the bell but do not lift it.',
      'At the top, the body is tall and braced; the bell floats momentarily.',
      'Let the bell swing back down under control, hinging again to absorb the load.',
      'Maintain the hinge pattern throughout — do not let the swing become squat-dominant.',
    ],
    breathing: ['Exhale sharply as the hips extend at the top. Inhale as the bell swings back down.'],
    cues: [
      '"Hinge, don\'t squat."',
      '"The hips drive — the arms just follow."',
      '"Let the bell float — don\'t muscle it up."',
      '"Brace and squeeze at the top."',
    ],
    commonMistakes: [
      'Squatting instead of hinging — knees bend too much and the swing loses its hip power.',
      'Lifting with the shoulders rather than letting the hips generate the power.',
      'Letting the lower back round at the hike.',
      'Letting the bell drift too far from the body at the hike.',
      'Bending the elbows to pull the bell higher instead of letting it float.',
    ],
    variations: [
      {
        name: 'Russian Swing',
        purpose: 'A chest-height variation — easier to learn and reduces shoulder stress.',
        formChange: 'Let the bell float to chest height rather than overhead. This is the standard starting point.',
        difficulty: 'easier',
      },
      {
        name: 'American Swing',
        purpose: 'Drives the bell overhead — increases range but demands more shoulder mobility and control.',
        formChange: 'Drive the bell all the way overhead to full arm extension at the top.',
        difficulty: 'harder',
      },
      {
        name: 'Dead-stop Swing',
        purpose: 'Removes momentum build-up between reps — useful for reinforcing technique.',
        formChange: 'Park the bell on the floor after each rep, reset the hinge, and hike again.',
        difficulty: 'similar',
      },
      {
        name: 'Single-arm Swing',
        purpose: 'Increases rotational demand and addresses grip and hip-stability differences.',
        formChange: 'Hold the bell with one hand and alternate sides between sets or reps.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Stop if you cannot maintain a flat back at the hike or a controlled finish position — technique deterioration signals fatigue.',
      'Clear the space around and behind you before swinging.',
      'Use a load that allows clean hip-hinge mechanics — overloading the swing before the pattern is solid is a common source of lower-back strain.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Romanian Deadlift ──────────────────────────────────────────────
  'kettlebell-romanian-deadlift': {
    exerciseKey: 'kettlebell-romanian-deadlift',
    displayName: 'Kettlebell Romanian Deadlift',
    summary: 'A hip-hinge movement using a kettlebell (or two), targeting the hamstrings and glutes. Mechanics are similar to a barbell RDL — the bell stays close to the legs throughout.',
    setup: [
      'Stand with feet hip-width, holding one or two kettlebells in front of the thighs.',
      'Set the shoulders back and down, brace lightly, and establish a neutral spine.',
    ],
    execution: [
      'Push the hips back and allow the kettlebells to travel close to the legs.',
      'Maintain a flat back and soft knees throughout.',
      'Lower to the point where you feel a comfortable hamstring stretch, then drive the hips forward to stand.',
      'Squeeze the glutes briefly at the top.',
      'Exhale as you return to standing.',
    ],
    breathing: ['Inhale and brace before hinging. Exhale as you drive back to standing.'],
    cues: [
      '"Push the hips back — not down."',
      '"Keep the bells close to the legs."',
      '"Feel the hamstrings stretch, then drive."',
    ],
    commonMistakes: [
      'Letting the bells drift forward away from the body.',
      'Bending the knees too much, turning it into a squat.',
      'Rounding the lower back to reach a greater depth.',
    ],
    variations: [
      {
        name: 'Two-kettlebell RDL',
        purpose: 'Allows greater load and a balanced bilateral feel.',
        formChange: 'Hold one kettlebell in each hand and hinge as normal.',
        difficulty: 'similar',
      },
      {
        name: 'Staggered-stance Kettlebell RDL',
        purpose: 'Adds unilateral challenge while keeping a base of support.',
        formChange: 'Step one foot slightly back, shift more weight to the front leg, and hinge.',
        difficulty: 'similar',
      },
      {
        name: 'Single-leg Kettlebell RDL',
        purpose: 'Full single-leg balance and hip-hinge challenge.',
        formChange: 'Hinge on one leg, allowing the other to extend back as a counterbalance. Use a lighter load.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Keep the load close to the body — a drifting bell increases lower-back stress.',
      'Do not force depth beyond your current hamstring flexibility and lower-back control.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Lunge ──────────────────────────────────────────────────────────
  'kettlebell-lunge': {
    exerciseKey: 'kettlebell-lunge',
    displayName: 'Kettlebell Lunge',
    summary: 'A lunge performed while holding one or two kettlebells. The load can be carried in a rack, suitcase, goblet, or farmer position, each changing the stability and muscular demand.',
    setup: [
      'Choose a carry position suited to your goal and load:',
      'Rack (one or two bells at shoulder): higher stability demand, good for strength.',
      'Suitcase (one bell at the side): adds lateral stability challenge.',
      'Goblet (one bell at chest): supports an upright torso, familiar from goblet squats.',
      'Stand tall with a controlled brace before stepping.',
    ],
    execution: [
      'Step forward or backward into a lunge, keeping the torso upright and the load stable.',
      'Lower the rear knee toward the floor in a controlled manner.',
      'Drive through the front foot to return, maintaining control of the kettlebell throughout.',
      'Guide the front knee to track over the toes.',
      'Exhale as you drive back to standing.',
    ],
    breathing: ['Inhale as you step and lower. Exhale as you return to standing.'],
    cues: [
      '"Stable load — don\'t let it sway."',
      '"Step to a controlled length before lowering."',
      '"Drive through the front heel."',
    ],
    commonMistakes: [
      'Letting the kettlebell pull the torso sideways (suitcase carry).',
      'Stepping too short, forcing the knee far forward.',
      'Losing the brace mid-lunge.',
    ],
    variations: [
      {
        name: 'Reverse Kettlebell Lunge',
        purpose: 'Reduces shear on the front knee and is often easier to balance.',
        formChange: 'Step backward instead of forward.',
        difficulty: 'easier',
      },
      {
        name: 'Walking Kettlebell Lunge',
        purpose: 'Adds continuous movement and cardiovascular demand.',
        formChange: 'Step forward continuously rather than returning to the start each rep.',
        difficulty: 'similar',
      },
      {
        name: 'Supported Kettlebell Lunge',
        purpose: 'Reduces balance demand when learning the loaded pattern.',
        formChange: 'Hold one kettlebell and touch a wall or rack with the free hand.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Choose a carry position and load that allow full control of the bell and the lunge pattern.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Sumo Deadlift ──────────────────────────────────────────────────
  'kettlebell-sumo-deadlift': {
    exerciseKey: 'kettlebell-sumo-deadlift',
    displayName: 'Kettlebell Sumo Deadlift',
    summary: 'A wide-stance deadlift with a kettlebell held between the legs. The wider stance shifts the hip angle and makes the bell path more vertical, with relatively more inner-thigh and glute involvement.',
    setup: [
      'Stand with feet wider than shoulder-width and toes turned out enough that the knees track over them when you sit into the hinge.',
      'Place the kettlebell between the feet.',
      'Hinge and grip the handle with both hands, keeping the back flat and the shoulders above or just ahead of the bell.',
    ],
    execution: [
      'Brace the core, then drive through the legs and hips to stand, keeping the bell close and the back neutral.',
      'Finish tall with hips fully extended and the bell hanging between the legs.',
      'Hinge to lower the bell with control, keeping the back flat throughout.',
      'Exhale as you stand.',
    ],
    breathing: ['Inhale and brace before lifting. Exhale as you stand.'],
    cues: [
      '"Knees and toes track in the same direction."',
      '"Drive the floor away."',
      '"Bell stays close — don\'t let it swing forward."',
    ],
    commonMistakes: [
      'Knees caving inward — guide them out over the toes.',
      'Rounding the lower back.',
      'Letting the bell swing forward as you stand.',
      'Stance too narrow to allow the bell to clear the floor comfortably.',
    ],
    variations: [
      {
        name: 'Elevated-start Sumo Deadlift',
        purpose: 'Reduces the range of motion — useful when flexibility limits the floor setup.',
        formChange: 'Place the kettlebell on a low box or riser so the starting position is more accessible.',
        difficulty: 'easier',
      },
      {
        name: 'Light-load Sumo Deadlift',
        purpose: 'Useful for learning the wide-stance hinge pattern.',
        formChange: 'Use a lighter kettlebell and focus on stance, brace, and bell path.',
        difficulty: 'easier',
      },
      {
        name: 'Double Kettlebell Sumo Deadlift',
        purpose: 'Increases load without requiring a barbell.',
        formChange: 'Hold two kettlebells side by side between the feet.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Choose a stance width that allows the knees to track comfortably over the toes without forcing the hips.',
      'Do not force the range of motion if the hips cannot reach a comfortable starting position — use an elevated start.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Kettlebell Single-Leg Deadlift ────────────────────────────────────────────
  'kettlebell-single-leg-deadlift': {
    exerciseKey: 'kettlebell-single-leg-deadlift',
    displayName: 'Kettlebell Single-Leg Deadlift',
    summary: 'A unilateral hip-hinge on one leg while holding a kettlebell. It challenges balance, hip stability, and hamstring control simultaneously. Starting with a small range of motion is a valid and sensible approach.',
    setup: [
      'Stand on one foot with a soft bend in the knee.',
      'Hold a kettlebell in the opposite hand (contralateral) or in both hands — contralateral tends to help balance for most people.',
      'Find a stable position before hinging.',
    ],
    execution: [
      'Hinge at the hip of the standing leg, allowing the torso to lower and the free leg to rise behind as a counterbalance.',
      'Keep the back flat and the hips as level as possible.',
      'Lower to the point you can reach with control — a small range is fine when learning.',
      'Drive the hip of the standing leg through to return to upright.',
      'Exhale as you return to standing.',
    ],
    breathing: ['Inhale before hinging. Exhale as you return to standing.'],
    cues: [
      '"Hinge at the hip — don\'t just bend forward."',
      '"Keep the hips level."',
      '"Control is more important than range."',
    ],
    commonMistakes: [
      'Letting the non-standing hip rotate or drop significantly.',
      'Rounding the back to reach a greater depth.',
      'Losing balance by hinging too quickly.',
    ],
    variations: [
      {
        name: 'Kickstand Deadlift',
        purpose: 'Provides a base of support while learning the single-leg hinge.',
        formChange: 'Place the toe of the rear foot lightly on the floor for balance rather than lifting it entirely.',
        difficulty: 'easier',
      },
      {
        name: 'Supported Single-leg RDL',
        purpose: 'Removes balance challenge — useful for focusing on hip-hinge mechanics.',
        formChange: 'Touch a wall or rack with the free hand throughout the movement.',
        difficulty: 'easier',
      },
      {
        name: 'Double Kettlebell Single-leg RDL',
        purpose: 'Increases the load for more advanced trainees.',
        formChange: 'Hold one kettlebell in each hand and hinge on one leg.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Use a load and range of motion that allow you to maintain balance and a flat back — a small, controlled range is more productive than a large, uncontrolled one.',
      'Perform near a support surface when learning in case balance is lost.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Pistol Squat ──────────────────────────────────────────────────────────────
  'pistol-squat': {
    exerciseKey: 'pistol-squat',
    displayName: 'Pistol Squat',
    summary: 'An advanced single-leg squat to full depth with the other leg extended forward. It demands significant ankle mobility, hip flexibility, quad strength, and balance. It is not necessary for general fitness and should be treated as a skill to develop progressively.',
    setup: [
      'Stand on one foot with the other leg extended forward.',
      'Arms extended forward help with counterbalance.',
      'A useful starting position is near a support (rack, TRX, wall) until the movement is reliable.',
    ],
    execution: [
      'Inhale and brace, then sit back and down on the standing leg, keeping the extended leg off the floor.',
      'Descend through a range of motion you can control — stopping above full depth is a valid approach while developing the pattern.',
      'Drive through the foot of the standing leg to return to upright.',
      'Exhale as you press back up.',
    ],
    breathing: ['Inhale before descending. Exhale as you stand back up.'],
    cues: [
      '"Counterbalance with the arms."',
      '"Control the descent — don\'t drop."',
      '"Drive through the whole foot."',
    ],
    commonMistakes: [
      'Dropping to the bottom without the ankle, hip, or strength to control it.',
      'Letting the standing knee cave inward.',
      'Losing the torso position or collapsing the chest.',
    ],
    variations: [
      {
        name: 'Assisted Pistol Squat',
        purpose: 'Allows the movement pattern with support, reducing the load on the single leg.',
        formChange: 'Hold a TRX, ring, or doorframe for assistance throughout the descent and ascent.',
        difficulty: 'easier',
      },
      {
        name: 'Box Pistol Squat',
        purpose: 'Limits the depth and removes the need for full ankle and hip range.',
        formChange: 'Sit back onto a box or bench at the bottom rather than continuing to full depth.',
        difficulty: 'easier',
      },
      {
        name: 'Counterbalanced Pistol Squat',
        purpose: 'A small weight held at arm\'s length helps shift the centre of mass and make balance easier.',
        formChange: 'Hold a light dumbbell or plate at arm\'s length in front as a counterbalance.',
        difficulty: 'similar',
      },
      {
        name: 'Weighted Pistol Squat',
        purpose: 'Adds external load once the bodyweight version is controlled.',
        formChange: 'Hold a kettlebell or dumbbell at the chest or in the goblet position.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Develop the movement progressively — ankle mobility, hip flexibility, and quad strength all need to be sufficient before attempting full depth.',
      'Practice near a support surface until the movement is reliable.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Jump Squat ────────────────────────────────────────────────────────────────
  'jump-squat': {
    exerciseKey: 'jump-squat',
    displayName: 'Jump Squat',
    summary: 'A plyometric exercise combining a squat descent with an explosive jump. It develops lower-body power and trains landing mechanics. Controlled landing is the most important element.',
    setup: [
      'Stand with feet roughly shoulder-width, toes slightly out.',
      'Typically performed with bodyweight — if loaded, use a light weight only after landing mechanics are reliable.',
    ],
    execution: [
      'Lower into a squat to a comfortable depth — roughly quarter to half-squat is common.',
      'Drive explosively through the feet to jump, fully extending the ankles, knees, and hips.',
      'Land softly on the balls of the feet, then the heels, allowing the knees to bend to absorb the impact.',
      'Land quietly — the sound of the landing is a useful feedback cue.',
      'Reset the position before initiating the next rep.',
    ],
    breathing: ['Exhale as you jump. Inhale as you reset.'],
    cues: [
      '"Land quietly."',
      '"Bend the knees as you land — absorb the impact."',
      '"Full extension at the top of the jump."',
      '"Reset before the next rep."',
    ],
    commonMistakes: [
      'Landing with stiff knees, which increases joint stress.',
      'Landing heavily or noisily, indicating inadequate eccentric control.',
      'Not fully extending through the jump.',
      'Rushing the reset and losing position between reps.',
    ],
    variations: [
      {
        name: 'Bodyweight Jump Squat',
        purpose: 'The standard starting point — no load, focused on pattern and landing.',
        formChange: 'Perform with bodyweight only, focusing on a quiet, controlled landing.',
        difficulty: 'easier',
      },
      {
        name: 'Countermovement Jump Squat',
        purpose: 'Uses a rapid dip before jumping to generate more power.',
        formChange: 'Perform a quick squat dip immediately before jumping.',
        difficulty: 'similar',
      },
      {
        name: 'Reduced-depth Jump Squat',
        purpose: 'Useful when learning or when full-depth causes landing issues.',
        formChange: 'Lower to a quarter squat only before jumping.',
        difficulty: 'easier',
      },
    ],
    safetyNotes: [
      'Stop if landing mechanics deteriorate — a loss of controlled knee bend on landing is a clear signal to rest or reduce volume.',
      'Use an appropriate surface — avoid concrete or uneven ground.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Box Jumps ─────────────────────────────────────────────────────────────────
  'box-jumps': {
    exerciseKey: 'box-jumps',
    displayName: 'Box Jumps',
    summary: 'A plyometric exercise involving a two-foot takeoff and landing on an elevated box. Box height selection is critical — the goal is a powerful jump and a controlled landing, not a scramble to reach a higher surface.',
    setup: [
      'Choose a box height you can land on safely with hips above knee level — a modest height is more productive than one that requires an unsafe scramble or a very deep squat landing.',
      'Stand facing the box with feet roughly shoulder-width.',
    ],
    execution: [
      'Hinge slightly and swing the arms back, then drive explosively through the feet, swinging the arms forward and up.',
      'Tuck the knees slightly to clear the box.',
      'Land on both feet with the knees bent to absorb the impact — aim for a stable, controlled landing.',
      'Stand tall on the box, then step (not jump) down to reduce impact on the landing.',
      'Reset before the next rep.',
    ],
    breathing: ['Exhale as you jump. Inhale as you reset on top.'],
    cues: [
      '"Arm swing generates power."',
      '"Land softly — bend on landing."',
      '"Step down — don\'t jump down."',
      '"Choose a height that lets you land cleanly."',
    ],
    commonMistakes: [
      'Choosing a box so high that the landing becomes a deep squat or requires unsafe scrambling.',
      'Jumping down from the box instead of stepping — this adds unnecessary impact.',
      'Landing stiffly without bending the knees.',
      'Not fully resetting before the next jump.',
    ],
    variations: [
      {
        name: 'Low-box Jump',
        purpose: 'Builds landing mechanics and power with a lower risk.',
        formChange: 'Use a short box (20–30 cm) and focus on powerful takeoff and controlled landing.',
        difficulty: 'easier',
      },
      {
        name: 'Paused Box Jump',
        purpose: 'Removes the countermovement and requires pure concentric power.',
        formChange: 'Pause for 2–3 seconds in the squat position before jumping.',
        difficulty: 'harder',
      },
      {
        name: 'Lateral Box Jump',
        purpose: 'Trains power in the frontal plane.',
        formChange: 'Jump onto the box from the side rather than the front.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Use a stable, non-slip box or platform.',
      'Always step down from the box rather than jumping down.',
      'Choose a height that allows a controlled landing with hips above knees — a lower height achieved cleanly is more useful than a high one achieved messily.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Broad Jumps ───────────────────────────────────────────────────────────────
  'broad-jumps': {
    exerciseKey: 'broad-jumps',
    displayName: 'Broad Jumps',
    summary: 'A horizontal plyometric exercise involving a two-foot takeoff and landing as far forward as possible. It trains explosive power in the horizontal direction and requires good landing control.',
    setup: [
      'Stand with feet shoulder-width on a clear, non-slip surface with enough space ahead.',
      'Bend the knees slightly and hinge at the hips, preparing to swing the arms.',
    ],
    execution: [
      'Swing the arms back, then drive them forward and up as you push through both feet to project the body horizontally.',
      'Aim for a long, controlled flight path rather than just maximum height.',
      'Land on both feet simultaneously with knees bent to absorb the impact.',
      'Stabilise the landing position — "stick" the landing before moving.',
      'Walk back and reset before the next rep rather than jumping repeatedly without control.',
    ],
    breathing: ['Exhale as you jump. Inhale as you reset.'],
    cues: [
      '"Drive forward, not just up."',
      '"Swing the arms for power."',
      '"Stick the landing — knees bent."',
      '"Reset between every rep."',
    ],
    commonMistakes: [
      'Jumping for height rather than distance.',
      'Landing with stiff knees.',
      'Not stabilising before the next jump, accumulating instability.',
    ],
    variations: [
      {
        name: 'Shorter-distance Broad Jump',
        purpose: 'Reduces the landing demand while building the horizontal-power pattern.',
        formChange: 'Jump for a reduced distance and focus on the landing before progressing.',
        difficulty: 'easier',
      },
      {
        name: 'Stick Landing Broad Jump',
        purpose: 'Emphasises landing control over distance.',
        formChange: 'Hold the landing position for 3 seconds before standing.',
        difficulty: 'similar',
      },
      {
        name: 'Bounding',
        purpose: 'A continuous single-leg version that adds reactive power demand.',
        formChange: 'Alternate single-leg takeoffs and landings over distance.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Use an appropriate surface — a sprung floor, grass, or a mat. Avoid concrete.',
      'Clear the landing zone before jumping.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Nordic Curl ───────────────────────────────────────────────────────────────
  'nordic-curl': {
    exerciseKey: 'nordic-curl',
    displayName: 'Nordic Curl',
    summary: 'An advanced eccentric hamstring exercise. The knees are anchored and the body lowers toward the floor under hamstring control. Even a partial range provides a significant training stimulus.',
    setup: [
      'Anchor the feet securely under a barbell, a partner\'s hands, a machine pad, or a dedicated Nordic-curl device.',
      'Kneel on a mat or padded surface.',
      'Keep the hips extended — the body should be in a straight line from knees to shoulders throughout.',
    ],
    execution: [
      'From the kneeling position, slowly lower the torso toward the floor by allowing the knees to extend.',
      'Control the descent with the hamstrings — do not drop.',
      'Partial range is a valid and effective starting point — there is no requirement to reach the floor.',
      'Use the hands to catch and assist the return phase, pushing back up to the start.',
      'Focus on the controlled lowering phase; the return is assisted.',
    ],
    breathing: ['Inhale as you lower. Exhale as you return.'],
    cues: [
      '"Lower with control — the slower the better."',
      '"Keep the hips extended — don\'t let them bend."',
      '"Even a small range done slowly is effective."',
    ],
    commonMistakes: [
      'Hinging at the hips rather than maintaining a straight body line.',
      'Dropping uncontrolled when hamstring fatigue occurs.',
      'Attempting a full range before the eccentric strength is sufficient.',
    ],
    variations: [
      {
        name: 'Partial Nordic Curl',
        purpose: 'The standard starting point — a 20–30-degree lowering can still provide significant stimulus.',
        formChange: 'Lower only as far as can be controlled before returning.',
        difficulty: 'easier',
      },
      {
        name: 'Band-assisted Nordic Curl',
        purpose: 'A band attached overhead reduces the effective load through the range.',
        formChange: 'Loop a resistance band over the shoulders from a fixed point above to reduce the load.',
        difficulty: 'easier',
      },
      {
        name: 'Full Nordic Curl',
        purpose: 'Full eccentric range to the floor with controlled return.',
        formChange: 'Lower all the way to the floor under control, then push back with the hands.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Build this exercise progressively — the eccentric load is high and tendon adaptation takes time.',
      'Do not attempt full range before the partial-range version is well controlled.',
      'Modify or stop for sharp pain, numbness, dizziness, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Step-ups ──────────────────────────────────────────────────────────────────
  'step-ups': {
    exerciseKey: 'step-ups',
    displayName: 'Step-ups',
    summary: 'A unilateral leg exercise stepping onto and off an elevated surface. It trains the quads, glutes, and hip stabilisers while challenging single-leg balance. Box height and load can be adjusted widely.',
    setup: [
      'Stand facing a box, step, or bench at a height where the hip is at or near 90 degrees when the foot is placed on the surface — adjust based on your leg length and goal.',
      'Bodyweight or loaded with dumbbells, a barbell, or a kettlebell.',
    ],
    execution: [
      'Place the whole foot of the working leg on the box.',
      'Drive through the working leg to stand on the box, bringing the other foot up.',
      'Avoid pushing off significantly with the trailing leg — the goal is to drive through the front foot.',
      'Lower the trailing foot to the floor in a controlled manner.',
      'Exhale as you step up.',
    ],
    breathing: ['Exhale as you step up. Inhale as you step down.'],
    cues: [
      '"Drive through the front foot — not the back."',
      '"Place the whole foot on the box."',
      '"Control the step down."',
    ],
    commonMistakes: [
      'Pushing off aggressively with the trailing foot, reducing the load on the working leg.',
      'Placing only the toes on the box.',
      'Stepping down too quickly or losing control on the descent.',
      'Box height too high, making trunk control difficult.',
    ],
    variations: [
      {
        name: 'Low Step-up',
        purpose: 'Reduces the range of motion demand — useful when learning or when hip mobility is limited.',
        formChange: 'Use a lower box or step (20–30 cm).',
        difficulty: 'easier',
      },
      {
        name: 'Supported Step-up',
        purpose: 'Reduces balance demand while learning the pattern.',
        formChange: 'Hold a rack or wall lightly with one hand for support.',
        difficulty: 'easier',
      },
      {
        name: 'Loaded Step-up',
        purpose: 'Increases the strength stimulus.',
        formChange: 'Hold dumbbells at the sides or a barbell on the back.',
        difficulty: 'harder',
      },
      {
        name: 'Lateral Step-up',
        purpose: 'Steps onto the box from the side, adding a frontal-plane challenge.',
        formChange: 'Stand beside the box and step up sideways with the near foot.',
        difficulty: 'similar',
      },
    ],
    safetyNotes: [
      'Use a stable, non-slip surface at an appropriate height.',
      'Avoid using so much trailing-leg push-off that the working leg is largely unloaded.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Tuck Jump ─────────────────────────────────────────────────────────────────
  'tuck-jump': {
    exerciseKey: 'tuck-jump',
    displayName: 'Tuck Jump',
    summary: 'A plyometric jump in which the knees are driven toward the chest at the peak of the jump. It combines jump power with a compact tuck phase and requires controlled landing. The knee height during the tuck should be comfortable — do not force an extreme range.',
    setup: [
      'Stand with feet shoulder-width on a clear, non-slip surface with enough overhead clearance.',
      'Bend the knees slightly and prepare to jump.',
    ],
    execution: [
      'Jump explosively, driving through both feet.',
      'At the peak of the jump, bring the knees toward the chest — compact but not forced.',
      'Extend the legs before landing.',
      'Land softly on the balls of the feet, bending the knees to absorb the impact.',
      'Land quietly and reset before the next rep.',
    ],
    breathing: ['Exhale as you jump. Inhale as you reset.'],
    cues: [
      '"Jump first, tuck second."',
      '"Land soft — bend on contact."',
      '"Reset between reps."',
    ],
    commonMistakes: [
      'Tucking before reaching the peak of the jump, reducing height.',
      'Landing with stiff knees.',
      'Not resetting between reps, leading to cumulative instability.',
      'Forcing an extreme tuck height that disrupts the jump.',
    ],
    variations: [
      {
        name: 'Lower-height Tuck Jump',
        purpose: 'Reduces the intensity while maintaining the jump-and-tuck pattern.',
        formChange: 'Focus on the tuck action from a lower jump height.',
        difficulty: 'easier',
      },
      {
        name: 'Squat Jump',
        purpose: 'Removes the tuck demand and focuses on jump power and landing.',
        formChange: 'Jump from a squat position without tucking the knees to the chest.',
        difficulty: 'easier',
      },
      {
        name: 'Continuous Tuck Jumps',
        purpose: 'Adds cardiovascular and reactive power demand.',
        formChange: 'Perform repeated tuck jumps with minimal ground contact time.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Use an appropriate surface and ensure sufficient overhead clearance.',
      'Stop if landing mechanics deteriorate — stiff or uncontrolled landings are a signal to rest.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },

  // ── Lateral Bound ─────────────────────────────────────────────────────────────
  'lateral-bound': {
    exerciseKey: 'lateral-bound',
    displayName: 'Lateral Bound',
    summary: 'A lateral plyometric exercise involving a single-leg push to the side and a controlled single-leg landing on the other foot. It develops power and control in the frontal plane and trains single-leg landing mechanics.',
    setup: [
      'Stand on one foot with a soft knee bend.',
      'Clear the space laterally on both sides.',
    ],
    execution: [
      'Push off the standing foot laterally, projecting the body sideways.',
      'Land on the opposite foot with the knee bent to absorb the impact.',
      'Stabilise the landing — "stick" the position before bounding back.',
      'Keep the hip and knee of the landing leg aligned over the foot.',
      'Bound back in the other direction once stable.',
    ],
    breathing: ['Exhale as you push off. Inhale as you stick and reset.'],
    cues: [
      '"Stick the landing — one second of stability."',
      '"Drive off the outside foot."',
      '"Land with the knee bent and the hip behind the foot."',
    ],
    commonMistakes: [
      'Landing with a stiff knee.',
      'Bounding back before stabilising the landing.',
      'Letting the knee cave inward on landing.',
    ],
    variations: [
      {
        name: 'Shorter-distance Lateral Bound',
        purpose: 'Reduces the landing force — useful when learning the pattern.',
        formChange: 'Bound a shorter distance and focus on a controlled, stable landing.',
        difficulty: 'easier',
      },
      {
        name: 'Supported Lateral Bound',
        purpose: 'Allows learning the push pattern with a hand on a surface for balance.',
        formChange: 'Touch a wall or rail lightly with one hand on the landing side.',
        difficulty: 'easier',
      },
      {
        name: 'Repeated Lateral Bounds',
        purpose: 'Adds reactive power demand with minimal ground contact time.',
        formChange: 'Reduce the stick time and bound continuously side to side.',
        difficulty: 'harder',
      },
    ],
    safetyNotes: [
      'Use an appropriate, non-slip surface and clear the lateral space before bounding.',
      'Always stabilise the landing before bounding back — avoid reactive bouncing before control is established.',
      'Modify or stop for sharp pain, numbness, dizziness, loss of balance, or other concerning symptoms. This content is coaching guidance, not medical advice — consult a qualified professional when appropriate.',
    ],
    contentVersion: 1,
    reviewedAt: '2025-01-01',
  },
};
