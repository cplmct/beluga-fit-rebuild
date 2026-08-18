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
};
