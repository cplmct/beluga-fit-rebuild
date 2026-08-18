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
};
