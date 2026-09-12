import { ImageSourcePropType } from 'react-native';
import { EXERCISES } from './exercises';

export interface GuidanceFrame {
  label: 'Start' | 'Mid' | 'Finish';
  caption: string;
  imageSource?: ImageSourcePropType;
}

export interface ExerciseGuidance {
  frames: GuidanceFrame[];
  tips: string[];
}

type GuidanceCopy = readonly [
  start: string,
  mid: string,
  finish: string,
  tips: readonly [string, string, ...string[]],
];

/*
 * Copy is kept separate from image assets so text-only guidance is a first-class
 * fallback. Every entry has three phases even when no artwork is approved.
 */
const GUIDANCE_COPY: Record<string, GuidanceCopy> = {
  'Bench Press': ['Lie flat with the bar over your lower chest, shoulder blades set, and feet planted.', 'Lower the bar with control toward the lower chest while your elbows track below the wrists.', 'Finish with the bar over the shoulders, arms extended, and shoulder blades still set.', ['Keep your feet flat and maintain a comfortable upper-back arch.', 'Keep the bar path controlled and breathe out as you press.', 'Do not bounce the bar off your chest.']],
  'Incline Bench Press': ['Set the bench to a moderate incline and position the bar over your upper chest.', 'Lower the bar toward the upper chest with wrists stacked over elbows.', 'Finish with the bar over the shoulders, arms extended, and upper back supported by the incline.', ['Keep your shoulder blades pulled down and back.', 'Use a grip that keeps your forearms nearly vertical at the bottom.']],
  'Decline Bench Press': ['Secure your legs on the decline bench and hold the bar above the lower chest.', 'Lower the bar toward the lower chest while keeping your hips and shoulders on the pad.', 'Finish with the bar over the lower chest, arms extended, and legs secured on the decline bench.', ['Use the bench leg supports before unracking.', 'Keep the bar controlled through the full range.']],
  'Dumbbell Press': ['Lie on a flat bench with dumbbells at chest level, palms facing forward.', 'Lower both dumbbells beside the chest with elbows slightly below the bench.', 'Finish with the dumbbells over the chest, arms extended, and shoulders supported by the bench.', ['Keep both shoulders in contact with the bench.', 'Move each dumbbell smoothly rather than letting one drift ahead.']],
  'Incline Dumbbell Press': ['Set an incline bench and hold dumbbells beside the upper chest with feet planted.', 'Lower the dumbbells in a wide, controlled arc while keeping forearms under the handles.', 'Finish with the dumbbells over the upper chest, wrists stacked, and elbows softly extended.', ['Keep your head and upper back supported.', 'Avoid letting the dumbbells drop below a comfortable shoulder position.']],
  'Chest Fly': ['Lie on a flat bench with dumbbells above the chest and palms facing inward.', 'Open the arms in a broad arc with a gentle elbow bend until the chest is stretched comfortably.', 'Finish with the dumbbells together over the chest, elbows softly bent, and shoulders supported.', ['Keep the elbow angle steady throughout the fly.', 'Use a lighter load than a press and avoid overstretching.']],
  'Cable Fly': ['Stand between cable stacks with handles at chest height and one foot slightly forward.', 'Sweep the handles forward in an arc while keeping a soft bend in your elbows.', 'Finish with the handles together in front of the chest, elbows soft, and torso upright.', ['Keep your ribs down instead of leaning into the cables.', 'Return the handles slowly so the chest stays loaded.']],
  'Push-ups': ['Place hands just wider than the shoulders and brace a straight line from head to heels.', 'Lower your chest toward the floor with elbows angled about 45 degrees from your sides.', 'Finish in a rigid plank with arms extended, hips level, and chest lifted from the floor.', ['Keep your neck neutral and look slightly ahead of your hands.', 'Use a knee-supported variation while preserving the same body line.']],
  'Dips': ['Support yourself on parallel bars with shoulders down and legs relaxed beneath you.', 'Bend your elbows and lower your body with a slight forward lean, stopping at a controlled depth.', 'Finish in a stable top support with elbows extended, chest lifted, and shoulders away from the ears.', ['Keep your shoulders below a comfortable range of motion.', 'Avoid swinging or bouncing at the bottom.']],
  'Pec Deck': ['Sit tall at the machine with forearms or hands against the pads and chest supported.', 'Bring the pads inward with your chest while keeping your shoulders down.', 'Finish with the pads together in front of mid-chest, elbows softly bent and shoulders down.', ['Adjust the seat so handles align with mid-chest.', 'Do not let the weights slam together.']],
  'Kettlebell Floor Press': ['Lie on the floor with kettlebells at chest level and knees bent, elbows resting lightly on the floor.', 'Press the kettlebells upward while keeping wrists stacked and upper arms controlled.', 'Finish with both kettlebells stacked over the chest, arms extended and shoulders settled on the floor.', ['Keep your lower back relaxed against the floor.', 'Use a neutral grip if that keeps your shoulders comfortable.']],
  'Kettlebell Pullover': ['Lie on your back holding one kettlebell over your chest with both hands.', 'Lower the bell in an arc behind your head while keeping ribs gently tucked.', 'Finish with the kettlebell over the chest, arms extended, and ribs held down against the floor.', ['Keep the elbow bend nearly unchanged.', 'Only lower as far as you can keep your back and ribs stable.']],
  'Pike Push-ups': ['Start in a pike with hands under shoulders, hips high, and heels lifted as needed.', 'Bend your elbows to lower the crown of your head toward the floor between your hands.', 'Finish in a high-hip pike with arms extended, head between the arms, and hands planted.', ['Keep your elbows angled back rather than flaring wide.', 'Walk your feet closer to increase shoulder loading gradually.']],
  'Archer Push-ups': ['Start in a wide-hand plank with one arm straight and the other hand turned slightly outward.', 'Lower your chest toward the bent arm while the opposite arm reaches long, keeping hips level.', 'Press through the bent arm to return to the wide plank, then switch sides.', ['Use a reduced range until you can keep the shoulders and hips square.', 'Move slowly rather than shifting your weight abruptly.']],
  'Diamond Push-ups': ['Set your hands close under the sternum with thumbs and index fingers forming a diamond.', 'Lower your chest toward your hands while keeping elbows close to your ribs.', 'Finish in a rigid plank with arms extended, hands under the sternum, and hips level.', ['Brace your abdomen before every rep.', 'Widen the hand position slightly if your wrists need less strain.']],
  'Pseudo Planche Push-ups': ['Start in a plank with hands turned slightly out and shoulders positioned ahead of the wrists.', 'Lower your chest while keeping the forward shoulder lean and elbows close.', 'Finish in a protracted plank with shoulders ahead of wrists, arms extended, and hips level.', ['Keep your feet grounded while learning the lean.', 'Move the shoulders forward only as far as you can control.']],
  'Muscle-ups': ['Hang from the bar with a firm grip, hollow body, and enough space to swing safely.', 'Pull the bar toward your upper chest, then rotate your shoulders over it in one controlled transition.', 'Finish in a stable support above the bar with elbows extended but not forced.', ['Use a progression before attempting an unassisted rep.', 'Keep the transition close to the bar rather than swinging away.']],

  'Deadlift': ['Stand with feet hip-width apart and the bar over mid-foot; hinge to grip it with a flat back.', 'Drive through the floor while keeping the bar close as it passes your knees.', 'Finish standing tall with the bar against your thighs, hips and knees extended, and shoulders stacked.', ['Brace before each pull and keep your lats engaged.', 'Do not lean back at lockout or squat the bar down.']],
  'Pull-ups': ['Hang from the bar with hands just outside shoulder width and ribs gently tucked.', 'Pull your elbows toward your ribs until your chin clears the bar.', 'Finish with your chin over the bar, chest lifted, and shoulders controlled away from the ears.', ['Avoid kicking or swinging for momentum.', 'Start with assisted pull-ups if you cannot control the descent.']],
  'Chin-ups': ['Hang with a shoulder-width underhand grip, legs quiet, and core braced.', 'Pull your chest toward the bar by driving elbows down and back.', 'Finish with your chin above the bar, elbows pulled toward the ribs, and torso steady.', ['Keep wrists neutral and avoid craning your neck.', 'Pause briefly at the top instead of bouncing.']],
  'Lat Pulldown': ['Sit with thighs secured and grip the bar just outside shoulder width.', 'Pull the bar toward your upper chest by driving elbows down and back.', 'Finish with the bar at the upper chest, torso tall, and shoulder blades drawn down.', ['Keep a slight lean, not a swinging recline.', 'Do not pull the bar behind your neck.']],
  'Barbell Row': ['Hinge with a flat back, hold the bar just outside your legs, and brace your abdomen.', 'Pull the bar toward your lower ribs while keeping hips and shoulders steady.', 'Finish with the bar at the lower ribs, elbows behind the torso, and spine held neutral.', ['Keep the bar close to your legs.', 'Use less weight if you must jerk the torso to start.']],
  'Dumbbell Row': ['Support one hand and knee on a bench with a flat back and dumbbell hanging below the shoulder.', 'Row the dumbbell toward your hip while keeping your elbow close to your torso.', 'Finish with the dumbbell beside the hip, elbow behind the ribs, and torso square to the bench.', ['Keep hips square to the bench.', 'Lead the pull with your elbow rather than your hand.']],
  'T-Bar Row': ['Straddle the bar with a hinged torso, neutral spine, and hands secured on the handle.', 'Pull the handle toward your midsection while keeping your chest stable.', 'Finish with the handle at the torso, elbows back, and the hinged spine long.', ['Brace before each pull.', 'Avoid rounding your upper back to gain range.']],
  'Seated Cable Row': ['Sit tall with knees softly bent, feet against the platform, and cable handle in both hands.', 'Pull the handle toward your navel by drawing elbows behind you.', 'Finish with the handle at the abdomen, chest tall, and shoulder blades gently retracted.', ['Keep the torso quiet instead of rocking back.', 'Finish each rep by squeezing between the shoulder blades.']],
  'Face Pulls': ['Set the cable at face height and hold the rope with thumbs pointing behind you.', 'Pull the rope toward your forehead while rotating the hands apart and keeping elbows high.', 'Finish with the rope beside your temples, elbows high, and shoulder blades controlled.', ['Use a light load and avoid arching your back.', 'Keep the upper arms level with the shoulders.']],
  'Hyperextensions': ['Position your hips on the pad with feet secured and spine neutral in a hip hinge.', 'Lower your torso by folding at the hips while keeping the back long.', 'Finish with the torso aligned to the legs, hips extended, and spine neutral rather than arched.', ['Move from the hips rather than curling the spine.', 'Squeeze the glutes at the top without leaning back.']],
  'Kettlebell Row': ['Hinge with one hand supported and hold the kettlebell below the working shoulder.', 'Row the kettlebell toward the hip while keeping the bell close to the body.', 'Finish with the kettlebell beside the hip, elbow back, and torso square to the support.', ['Brace the non-working side of your core.', 'Do not rotate to lift a heavier bell.']],
  'Kettlebell Deadlift': ['Place the kettlebell between your feet and hinge back with both hands on its handle.', 'Push the floor away while the kettlebell travels close to your legs.', 'Finish upright with the kettlebell against the thighs, hips extended, and shoulders relaxed.', ['Keep shoulders above the bell at the start.', 'Finish with glutes tight, not with a backward lean.']],
  'Kettlebell Renegade Row': ['Set two kettlebells under your shoulders in a strong plank with feet wide for balance.', 'Row one kettlebell toward the hip while the opposite hand and feet resist rotation.', 'Finish with one kettlebell at the hip and the body held in a level, rotation-resistant plank.', ['Keep hips as square to the floor as possible.', 'Use stable bells with flat bases.']],
  'Kettlebell Good Morning': ['Hold a kettlebell at the chest and stand tall with feet about hip width apart.', 'Push hips back into a shallow hinge while keeping the spine long and knees soft.', 'Finish upright with the kettlebell at the chest, hips extended, and spine neutral.', ['Keep the bell close to your chest.', 'Feel the hamstrings load before returning.']],
  'Typewriter Pull-ups': ['Hang with a wide grip and brace your body beneath the bar.', 'Pull up, then shift your chest slowly toward one hand while the other arm lengthens.', 'Finish with the chest near one hand, the opposite arm longer, and hips held steady.', ['Use an assisted version to practice the side-to-side path.', 'Keep shoulders packed rather than hanging into one arm.']],
  'Australian Pull-ups': ['Set a low bar at chest height and hang beneath it with heels on the floor.', 'Pull your chest to the bar while keeping your body in one straight line.', 'Finish with the chest at the bar, elbows behind you, and hips aligned with the shoulders.', ['Adjust foot position to change difficulty.', 'Keep your ribs and pelvis connected throughout.']],

  'Overhead Press': ['Rest the bar on the front shoulders with hands just outside them and elbows slightly forward.', 'Press the bar straight up while moving your head around the bar path.', 'Finish with the bar stacked over shoulders, hips, and mid-foot.', ['Brace your core and squeeze your glutes.', 'Return the head forward after the bar clears it.']],
  'Military Press': ['Stand with a bar at the front shoulders, feet together or comfortably narrow, and core braced.', 'Press overhead without using a leg drive, keeping the bar close to your face.', 'Lock the bar overhead with ribs down and arms aligned with your ears.', ['Keep glutes tight to limit lower-back sway.', 'Use a controlled descent to the shoulders.']],
  'Dumbbell Shoulder Press': ['Hold dumbbells at shoulder height with wrists over elbows and palms facing forward.', 'Press both dumbbells upward in a slight inward arc while keeping your torso tall.', 'Finish with the weights overhead and elbows softly extended.', ['Keep your ribs from flaring as you press.', 'Lower both dumbbells at the same steady pace.']],
  'Arnold Press': ['Start seated or standing with dumbbells at the shoulders, palms facing you.', 'Rotate the palms forward while pressing the dumbbells overhead in one smooth path.', 'Finish overhead with palms forward, wrists stacked, and elbows softly extended.', ['Keep your elbows under your wrists during the rotation.', 'Use a lighter load than a standard shoulder press.']],
  'Lateral Raises': ['Stand with dumbbells by your thighs, elbows softly bent, and shoulders relaxed.', 'Raise the dumbbells out to the sides until the upper arms approach shoulder height.', 'Finish with the dumbbells near shoulder height, arms out to the sides, and neck relaxed.', ['Lead with the elbows rather than shrugging.', 'Stop below shoulder height if that preserves control.']],
  'Front Raises': ['Stand tall with dumbbells in front of your thighs and palms facing your legs.', 'Raise one or both dumbbells forward to shoulder height with a soft elbow bend.', 'Finish with the dumbbells at shoulder height, arms in front, and torso upright.', ['Keep your torso still and avoid using momentum.', 'Do not lift above a comfortable shoulder range.']],
  'Rear Delt Fly': ['Hinge forward with a flat back and hold dumbbells below the chest, palms facing inward.', 'Sweep the weights outward by moving the upper arms while keeping the torso fixed.', 'Finish with the dumbbells wide at shoulder level, elbows softly bent, and back flat.', ['Use a light load and keep elbows softly bent.', 'Avoid turning the movement into a row.']],
  'Upright Row': ['Stand with a barbell in front of the thighs and hands comfortably inside shoulder width.', 'Lift the bar by driving elbows up and out while keeping it close to the body.', 'Lower the bar smoothly to the thighs without shrugging through the descent.', ['Use a range that feels comfortable for your shoulders.', 'Do not yank the bar or force the elbows high.']],
  'Shrugs': ['Stand tall with dumbbells at your sides and arms relaxed.', 'Lift both shoulders straight toward your ears without rolling them.', 'Finish with both shoulders elevated toward the ears, arms long, and head neutral.', ['Keep your neck long and head still.', 'Use a controlled pause at the top rather than bouncing.']],
  'Cable Lateral Raises': ['Stand beside a low cable and hold the handle with the outside hand, arm across the body.', 'Raise the handle out to the side until the upper arm nears shoulder height.', 'Lower the cable across the body under control while keeping the torso upright.', ['Keep the cable moving in line with the shoulder.', 'Avoid leaning away from the stack.']],
  'Kettlebell Press': ['Clean one kettlebell to the rack position with wrist straight and elbow near your ribs.', 'Press the bell overhead while keeping the forearm vertical and ribs stacked.', 'Lower the bell back to the rack position without losing your brace.', ['Keep the bell resting between forearm and upper arm.', 'Squeeze the glute on the working side.']],
  'Kettlebell Halo': ['Hold a kettlebell by the horns at chest height with feet planted.', 'Circle the bell around your head while keeping the ribs down and neck relaxed.', 'Return the bell to the chest after completing a smooth circle.', ['Move slowly and keep the bell close to your head.', 'Reverse directions evenly between repetitions.']],
  'Kettlebell Clean and Press': ['Swing the kettlebell between your legs and guide it into a quiet rack position.', 'Drive through the legs and press the bell overhead without twisting.', 'Finish with the kettlebell locked overhead, wrist straight, and body stacked beneath it.', ['Keep the bell close during the clean.', 'Coordinate the clean and press rather than muscling the bell away from you.']],
  'Kettlebell Front Raise': ['Hold one kettlebell by the horns in front of your thighs with a tall posture.', 'Raise the bell forward to shoulder height while keeping the elbows softly bent.', 'Lower the bell back to the thighs with the same controlled path.', ['Brace your abdomen so the torso does not lean back.', 'Use a modest range and load for the front shoulder.']],
  'Handstand Push-ups': ['Set hands shoulder width apart and kick or walk into a stable handstand against a wall.', 'Bend the elbows to lower the head between the hands while keeping the body stacked.', 'Press the floor away to return to straight arms and a stable handstand.', ['Use wall support and a padded surface while learning.', 'Keep the elbows angled slightly forward instead of flaring.']],
  'Wall Walk': ['Start in a plank with feet near a wall and hands under your shoulders.', 'Walk your hands toward the wall while stepping your feet upward, keeping the ribs braced.', 'Finish close to the wall in a controlled handstand line with ribs braced and hands planted.', ['Move one small step at a time.', 'Keep hands planted and avoid dropping from the wall.']],

  'Barbell Curl': ['Stand with a bar at your thighs, palms forward, and elbows close to your sides.', 'Curl the bar by bending the elbows while keeping the upper arms still.', 'Finish with the bar near shoulder height, elbows by the ribs, and wrists straight.', ['Do not lean back to start the bar.', 'Keep wrists stacked over your forearms.']],
  'Dumbbell Curl': ['Stand tall with dumbbells at your sides and palms facing forward.', 'Curl the weights by bending only at the elbows while upper arms stay still.', 'Finish with both dumbbells near shoulder height, elbows tucked, and shoulders relaxed.', ['Avoid swinging your torso.', 'Keep elbows pinned near the ribs.']],
  'Hammer Curl': ['Hold dumbbells at your sides with palms facing inward and shoulders relaxed.', 'Curl the weights with a neutral grip while keeping elbows close to your body.', 'Finish with the dumbbells near the shoulders, thumbs up, and upper arms still.', ['Keep the thumbs pointing up throughout.', 'Use alternating reps if it helps prevent torso sway.']],
  'Preacher Curl': ['Set the upper arms firmly on the preacher pad with an underhand grip on the bar.', 'Curl the bar toward the shoulders while keeping the upper arms fixed to the pad.', 'Finish with the bar near the shoulders and upper arms fully supported by the pad.', ['Adjust the seat so the armpits rest comfortably at the pad top.', 'Avoid bouncing out of the bottom.']],
  'Cable Curl': ['Face the cable with a straight bar or handle held at thigh level and elbows by your sides.', 'Curl the handle toward the shoulders while keeping tension in the cable.', 'Finish with the handle near the shoulders, elbows tucked, and cable taut.', ['Stand far enough back to keep tension at the bottom.', 'Keep your shoulders down throughout the curl.']],
  'Tricep Dips': ['Support your body on parallel bars with an upright torso and elbows close.', 'Bend the elbows to lower your body under control while keeping shoulders comfortable.', 'Finish in the supported top position with elbows extended and torso upright.', ['Use an assisted station when needed.', 'Keep movement smooth and avoid bouncing at the bottom.']],
  'Close-grip Bench Press': ['Lie on the bench with hands narrower than a standard press and the bar over the chest.', 'Lower the bar toward the lower chest with elbows tracking close to your sides.', 'Press the bar up while keeping wrists stacked and shoulder blades set.', ['Do not make the grip so narrow that wrists bend sharply.', 'Keep feet planted during the press.']],
  'Tricep Pushdown': ['Stand at a cable with the rope or bar at chest height and elbows tucked beside you.', 'Push the handle down by extending the elbows without moving the upper arms.', 'Finish with the handle beside the thighs, elbows extended, and shoulders relaxed.', ['Keep shoulders relaxed instead of leaning over the cable.', 'Separate the rope ends only at a comfortable finish.']],
  'Overhead Tricep Extension': ['Hold one dumbbell overhead with both hands and elbows pointing forward.', 'Lower the dumbbell behind your head by bending the elbows while keeping upper arms still.', 'Extend the elbows to bring the dumbbell overhead without flaring the ribs.', ['Use a stance that lets you brace comfortably.', 'Keep the elbows pointing toward the ceiling.']],
  'Skull Crushers': ['Lie on a bench holding the bar above the chest with arms extended and elbows fixed.', 'Bend the elbows to lower the bar toward the forehead or just behind it.', 'Finish with the bar above the chest, elbows extended, and upper arms still.', ['Use a spotter or safety pins for a heavy set.', 'Move only at the elbows and keep wrists neutral.']],
  'Kettlebell Curl': ['Stand with the kettlebell held by its horns in front of the thighs and elbows near the ribs.', 'Curl the kettlebell toward the chest without letting the shoulders roll forward.', 'Finish with the kettlebell near the chest, elbows tucked, and wrists neutral.', ['Keep the bell centered rather than twisting the wrists.', 'Brace the torso to prevent leaning back.']],
  'Kettlebell Tricep Extension': ['Hold a kettlebell overhead by the horns with elbows pointed forward.', 'Bend the elbows to lower the bell behind the head while keeping upper arms still.', 'Finish with the kettlebell overhead, elbows extended, and ribs held down.', ['Choose a load you can stabilize overhead.', 'Keep the head neutral as the bell travels behind it.']],
  'Kettlebell Hammer Curl': ['Hold the kettlebell handle with a neutral grip and arm resting by your side.', 'Curl the bell toward the shoulder while keeping the thumb side of the hand up.', 'Finish with the kettlebell near the shoulder, thumb up, and elbow close to the waist.', ['Keep your elbow near your waist.', 'Avoid rotating the torso to gain momentum.']],

  'Squat': ['Place the bar on your upper back with feet about shoulder width and toes slightly out.', 'Sit down and back with knees tracking over toes while the chest stays lifted.', 'Finish standing tall with the bar balanced over mid-foot, hips and knees extended.', ['Brace before descending and breathe out through the sticking point.', 'Keep knees from collapsing inward.']],
  'Pause Squat': ['Set up for a barbell squat with a braced torso and balanced foot pressure.', 'Descend under control, pause at your chosen depth without relaxing, then maintain knee tracking.', 'Finish standing tall after the pause with the bar over mid-foot and torso braced.', ['Use a lighter load than a regular squat.', 'Stay tight during the pause instead of resting on your joints.']],
  'Front Squat': ['Rest the bar across the front shoulders with elbows high and feet about shoulder width.', 'Squat between the hips while keeping elbows lifted and torso upright.', 'Finish upright with hips and knees extended, elbows high, and the bar supported across the shoulders.', ['Keep the bar supported by the shoulders, not your hands.', 'Brace hard to prevent the chest from folding forward.']],
  'Leg Press': ['Sit in the machine with your back supported and feet shoulder width on the platform.', 'Lower the platform by bending knees while keeping heels and hips supported.', 'Finish with the platform pressed away, feet flat, and knees softly extended.', ['Keep knees tracking in line with the toes.', 'Use a depth that keeps your lower back against the pad.']],
  'Leg Extension': ['Sit against the pad with the ankle roller above your feet and knees aligned with the pivot.', 'Extend the knees to raise the roller while keeping thighs against the seat.', 'Finish with the knees extended, ankle roller high, and thighs held against the seat.', ['Adjust the machine pivot to your knee joint.', 'Pause briefly at the top instead of kicking the pad.']],
  'Leg Curl': ['Lie or sit in the curl machine with the roller positioned just above your ankles.', 'Bend your knees to draw the roller toward the hamstrings while hips stay down.', 'Finish with the roller curled toward the seat and hips pressed firmly into the pad.', ['Keep the hips pressed into the pad.', 'Use a smooth tempo through the full comfortable range.']],
  'Romanian Deadlift': ['Stand with a bar at the thighs, knees softly bent, and shoulders pulled down.', 'Push the hips back while the bar slides close down the legs and the back stays flat.', 'Finish tall with the bar at the thighs, hips extended, and hamstrings engaged.', ['Keep the bar near your body.', 'Do not chase depth by rounding your lower back.']],
  'Lunges': ['Stand tall with dumbbells at your sides and feet together, chest lifted.', 'Step forward and lower the back knee toward the floor while the front shin stays controlled.', 'Finish in a balanced split stance with the front foot planted, torso upright, and knees extended.', ['Keep the front knee tracking over the second toe.', 'Use a stride that lets the torso stay upright.']],
  'Bulgarian Split Squat': ['Stand in a split stance with the rear foot supported behind you and dumbbells at your sides.', 'Lower the back knee toward the floor while the front foot stays planted and knee tracks forward.', 'Finish tall in the split stance with the front leg extended and hips square.', ['Keep most of your pressure in the front leg.', 'Set the rear-foot height low enough to stay balanced.']],
  'Calf Raises': ['Place the balls of your feet on the machine platform with shoulders or hips supported as designed.', 'Lower the heels slowly below the platform edge to load the calves.', 'Push through the balls of the feet to rise as high as you can control.', ['Keep ankles traveling straight rather than rolling out.', 'Pause at both the stretch and the top.']],
  'Leg Abduction': ['Sit upright with the outer thighs against the machine pads and feet supported.', 'Press the legs outward from the hips while keeping your pelvis against the seat.', 'Finish with the legs opened against the pads, pelvis supported, and torso upright.', ['Use a controlled range rather than bouncing the pads.', 'Keep your torso still throughout.']],
  'Kettlebell Goblet Squat': ['Hold the kettlebell by its horns at chest height with feet shoulder width and toes slightly out.', 'Sit between your hips while keeping the bell close and elbows tracking inside the knees.', 'Finish standing tall with the kettlebell at the chest, hips extended, and knees tracking forward.', ['Keep your knees aligned with your toes.', 'Brace your trunk so the bell does not pull you forward.']],
  'Kettlebell Swing': ['Set the kettlebell just ahead of your feet and hinge back to grip the handle.', 'Hike the bell between your legs, then snap the hips forward to float it to chest height.', 'Finish tall with the bell at chest height, arms relaxed, and hips fully extended.', ['Power the swing with hips, not an arm lift.', 'Keep shoulders down and the bell close on the way back.']],
  'Kettlebell Romanian Deadlift': ['Hold a kettlebell at the thighs with feet hip width and knees softly bent.', 'Hinge the hips back as the bell travels close along the legs and the spine stays long.', 'Finish standing tall with the bell at the thighs, hips extended, and back neutral.', ['Keep the kettlebell centered between your legs.', 'Stop the descent before your back rounds.']],
  'Kettlebell Lunge': ['Hold a kettlebell securely at the chest or by your side and stand tall.', 'Step forward and lower under control while the front knee tracks over the foot.', 'Finish in a stable split stance with the front heel grounded and torso upright.', ['Keep the bell close to limit torso sway.', 'Choose a stride that keeps the front heel grounded.']],
  'Kettlebell Sumo Deadlift': ['Take a wide stance with toes turned out and the kettlebell between your feet.', 'Hinge and bend the knees to grip the bell while keeping the chest open.', 'Finish tall with the kettlebell at arm’s length, hips extended, and knees tracking over toes.', ['Keep knees pointed in the same direction as your toes.', 'Do not lean backward at lockout.']],
  'Kettlebell Single-Leg Deadlift': ['Balance on one leg holding a kettlebell in the opposite hand with a soft standing knee.', 'Hinge forward as the free leg reaches back and the bell stays below the shoulder.', 'Finish balanced on one leg with the torso and free leg extended in one line.', ['Keep hips square to the floor.', 'Use a wall or light support while building balance.']],
  'Pistol Squat': ['Balance on one leg with the other leg extended forward and arms reaching for counterbalance.', 'Sit down on the standing leg while keeping the extended leg and heel lifted.', 'Finish standing on one leg with the free leg extended forward and knee tracking over the foot.', ['Use a box or support for a controlled progression.', 'Move only as deep as you can keep the foot grounded.']],
  'Jump Squat': ['Stand with feet about shoulder width and arms relaxed, ready to absorb a landing.', 'Dip into a squat and swing the arms as you jump vertically from both feet.', 'Finish the landing with knees tracking over toes, hips back, and both feet stable.', ['Keep jumps low enough to land quietly.', 'Absorb the landing through hips, knees, and ankles.']],
  'High Knees': ['Stand tall with arms bent and feet under the hips, ready to move lightly.', 'Alternate driving each knee toward hip height while the opposite arm swings naturally.', 'Finish with one knee lifted toward hip height, torso tall, and the opposite foot light on the floor.', ['Land softly on the balls of the feet.', 'Keep the torso tall instead of leaning backward.']],
  'Box Jumps': ['Stand facing a stable box with feet hip width and choose a height you can land on safely.', 'Swing the arms and jump onto the box, bringing both feet up together.', 'Finish standing tall on the box with both feet planted and knees softly bent.', ['Step down rather than jumping down when possible.', 'Land with knees aligned over feet.']],
  'Broad Jumps': ['Stand with feet hip width and arms back, ready to jump forward into open space.', 'Swing the arms and extend the hips, knees, and ankles to travel forward.', 'Finish in a balanced landing with hips back, knees bent, and both feet planted.', ['Clear the landing area before starting.', 'Prioritize a quiet, controlled landing over distance.']],
  'Nordic Curl': ['Kneel with ankles secured and hips extended, keeping the torso tall.', 'Lower the body forward as one unit by resisting with the hamstrings.', 'Finish in a controlled forward lean with hips extended, hands ready to assist, and ankles secured.', ['Use a pad under the knees.', 'Keep hips extended instead of folding at the waist.']],
  'Step-ups': ['Face a stable step with one full foot placed on top and arms ready to balance.', 'Drive through the elevated foot to bring the body upright without pushing hard from the floor leg.', 'Finish standing tall on the step with the working foot planted and pelvis level.', ['Keep the whole working foot on the step.', 'Choose a height that allows a level, controlled pelvis.']],
  'Tuck Jump': ['Stand with feet under the hips and arms relaxed, preparing to land softly.', 'Jump upward and draw both knees toward the chest while keeping the torso tall.', 'Finish the landing with feet under the hips, knees bent, and chest lifted.', ['Use your arms to assist the jump, not to pull the knees aggressively.', 'Allow enough space to land without obstacles.']],
  'Lateral Bound': ['Stand on one leg with the knee soft and arms ready to counterbalance.', 'Push sideways from the standing foot and travel to the opposite side.', 'Finish balanced on the opposite leg with hips back, knee aligned, and the free leg lifted.', ['Keep the landing knee aligned with the toes.', 'Start with short bounds and increase distance only when stable.']],

  'Plank': ['Set forearms under shoulders with legs extended and body in a straight line.', 'Hold the plank while bracing the abdomen, glutes, and thighs and breathing steadily.', 'End the hold by lowering the knees or hips with control rather than sagging.', ['Keep hips level instead of piking or dropping.', 'Squeeze the glutes to support the neutral body line.']],
  'Side Plank': ['Lie on one side with the elbow under the shoulder and legs stacked or staggered.', 'Lift the hips and hold a straight line from head to feet while breathing steadily.', 'Lower the hips under control and switch sides after the hold.', ['Press the floor away with the supporting forearm.', 'Keep the top shoulder stacked over the bottom one.']],
  'Crunches': ['Lie on your back with knees bent, feet planted, and fingertips lightly behind the head.', 'Curl the ribs toward the pelvis by lifting the shoulder blades without pulling the neck.', 'Finish with the shoulder blades lifted, ribs curled toward the pelvis, and neck relaxed.', ['Keep the lower back comfortable and pelvis still.', 'Exhale as you curl upward.']],
  'Bicycle Crunches': ['Lie on your back with hands light behind the head and knees lifted over the hips.', 'Rotate one shoulder toward the opposite knee as the other leg extends, then alternate smoothly.', 'Finish with one shoulder rotated toward the opposite knee, the other leg extended, and elbows wide.', ['Move from the ribs rather than pulling the head.', 'Keep the extended leg low only if your back stays stable.']],
  'Russian Twists': ['Sit with knees bent and torso leaning back, holding hands or a weight near the chest.', 'Rotate the ribcage from side to side while keeping the hips as still as possible.', 'Finish rotated toward one side with the weight beside the hip and chest lifted.', ['Keep the spine long rather than collapsing the chest.', 'Slow the rotation instead of using arm swings.']],
  'Leg Raises': ['Lie on your back with legs extended and hands beside you or under the hips for support.', 'Raise the legs together by curling the pelvis slightly while keeping the lower back controlled.', 'Finish with both legs raised, pelvis gently tucked, and lower back supported.', ['Use a shorter range if the back lifts off the floor.', 'Keep the movement smooth rather than kicking.']],
  'Hanging Leg Raises': ['Hang from a bar with shoulders active, legs together, and pelvis slightly tucked.', 'Raise the straight legs by curling the pelvis toward the ribs without swinging.', 'Finish with both legs raised toward the bar, shoulders active, and torso steady.', ['Start with bent knees if straight legs are not controlled.', 'Stop the swing before lifting again.']],
  'Ab Wheel': ['Kneel with the wheel under your shoulders, hips slightly forward, and abdomen braced.', 'Roll the wheel forward while keeping ribs down and hips from dropping.', 'Finish in a long rollout with the wheel ahead of the shoulders, ribs tucked, and hips aligned.', ['Use a shorter rollout while learning control.', 'Keep the lower back from arching at full reach.']],
  'Cable Crunches': ['Kneel facing a high cable with the rope beside your head and hips stacked over knees.', 'Curl your ribs toward your pelvis against the cable while keeping hips mostly still.', 'Finish curled with elbows near the thighs, ribs toward the pelvis, and hips over the knees.', ['Think of closing the space between ribs and hips.', 'Use a load that does not force hip hinging.']],
  'Mountain Climbers': ['Start in a strong high plank with hands beneath shoulders and feet behind you.', 'Drive one knee toward the chest, then switch legs while keeping shoulders over hands.', 'Finish with one knee under the chest, opposite leg extended, and hips level in the plank.', ['Keep hips from bouncing high.', 'Choose a pace that preserves the plank position.']],
  'Jumping Jacks': ['Stand with feet together and arms by your sides, knees softly bent.', 'Jump feet apart while sweeping arms overhead in one coordinated movement.', 'Jump feet together and lower arms softly to return to the start.', ['Land quietly with knees relaxed.', 'Use a step-out version if jumping is not appropriate.']],
  'Burpees': ['Stand tall, then place hands down in front of the feet with a braced torso.', 'Step or jump the feet back to a plank, lower the chest if using a full rep, and bring feet forward.', 'Stand and make a small vertical jump or reach overhead before resetting.', ['Keep hands under shoulders in the plank.', 'Step instead of jumping to control impact and pace.']],
  'Kettlebell Turkish Get-Up': ['Lie on your back with the loaded-side knee bent and foot planted; extend the opposite arm and leg while the kettlebell stays locked over the shoulder.', 'Roll toward the opposite elbow, post that hand, bridge through the planted foot, and sweep the extended leg underneath while keeping the bell stacked.', 'Stand tall with the kettlebell overhead, shoulders and hips stacked, and loaded-side foot planted.', ['Practice each transition with an unweighted hand first.', 'Keep eyes on the kettlebell and move slowly.']],
  'Kettlebell Windmill': ['Stand wide with one kettlebell overhead and toes turned slightly away from the loaded side.', 'Push the hip toward the unloaded side and hinge down while keeping the bell stacked overhead.', 'Drive through the feet to return upright without bending the loaded arm.', ['Rotate the chest toward the bell.', 'Use a shallow range until hamstring and shoulder control are secure.']],
  'Kettlebell Russian Twist': ['Sit with knees bent and hold a kettlebell close to the chest while leaning back slightly.', 'Rotate the torso side to side, guiding the bell across the body without collapsing the spine.', 'Return the bell to center with control before ending the movement.', ['Keep the hips grounded and feet stable.', 'Use a slow range instead of swinging the kettlebell.']],
  "Kettlebell Farmer's Carry": ['Stand tall holding a kettlebell in each hand with shoulders level and arms long.', 'Walk with short, controlled steps while keeping the torso upright and the bells quiet.', 'Stop under control and set the kettlebells down by hinging at the hips.', ['Brace as if preparing for contact.', 'Keep the shoulders away from the ears.']],
  'Kettlebell Around the World': ['Stand tall holding a kettlebell at the waist with feet planted and core braced.', 'Pass the bell around the body from hand to hand while keeping the torso still.', 'Bring the kettlebell back to the front and reset before reversing direction.', ['Keep the circle close to the body.', 'Use a light bell so the handoff stays controlled.']],
  'L-Sit': ['Support yourself on parallel handles or the floor with arms straight and shoulders depressed.', 'Press down through the hands and lift the hips while extending the legs forward.', 'Hold the legs as high as control allows, then lower them before the shoulders collapse.', ['Tuck the knees as a progression.', 'Keep the chest lifted and avoid shrugging.']],
  'Dragon Flag': ['Lie on a bench holding its edge behind the head with legs raised and body braced.', 'Lower the rigid body toward the bench by hinging at the shoulders while hips and legs stay aligned.', 'Pull the body back to the raised position without swinging the legs.', ['Use a bent-knee progression first.', 'Stop before the lower back arches.']],
  'Hollow Body Hold': ['Lie on your back with arms overhead, legs extended, and lower back pressed toward the floor.', 'Lift the shoulders and legs slightly while maintaining the hollow curve and steady breathing.', 'Bend the knees or lower the shoulders to exit without letting the back snap up.', ['Shorten the lever by bending the knees when needed.', 'Keep ribs tucked toward the pelvis.']],
  'Superman Hold': ['Lie face down with arms extended overhead and legs long, forehead hovering or resting lightly.', 'Lift the arms, chest, and legs a small amount while keeping the neck neutral.', 'Lower with control and relax briefly before repeating the hold.', ['Think of lengthening rather than cranking higher.', 'Keep movements small and smooth.']],
  'Bear Crawl': ['Start on hands and toes with knees hovering just above the floor and hips low.', 'Step the opposite hand and foot forward while keeping the back flat, then alternate.', 'Slow to a stop and lower the knees with control after the set.', ['Keep knees close to the floor.', 'Move quietly so the hips do not sway side to side.']],
  'Inchworm': ['Stand tall, hinge to place hands on the floor, and keep the legs as straight as comfortable.', 'Walk the hands forward to a high plank while the hips and ribs stay controlled.', 'Walk the hands back toward the feet and stand by hinging through the hips.', ['Bend the knees slightly rather than rounding aggressively.', 'Keep shoulders over the hands in the plank.']],
  'Burpee Pull-up': ['Stand beneath a secure pull-up bar with enough clearance to jump safely.', 'Drop to a plank, bring the feet forward, jump to the bar, and pull the chest toward it.', 'Lower from the pull-up under control, land softly, and return to standing.', ['Use a step-back or assisted pull-up progression.', 'Keep the bar and landing area clear.']],
};

// Only exact exercise/equipment matches and previously approved semantic mappings
// are included. In particular, no Military Press, Archer Push-up, dumbbell
// Upright Row, machine Calf Raise, or dumbbell Goblet Squat artwork is reused.
const IMAGE_SOURCES: Record<string, { start?: ImageSourcePropType; finish?: ImageSourcePropType }> = {
  'Bench Press': { start: require('../../assets/guidance/barbell-bench-press-start.webp'), finish: require('../../assets/guidance/barbell-bench-press-finish.webp') },
  'Incline Bench Press': { start: require('../../assets/guidance/incline-bench-press-start.webp'), finish: require('../../assets/guidance/incline-bench-press-finish.webp') },
  'Decline Bench Press': { start: require('../../assets/guidance/decline-bench-press-start.webp'), finish: require('../../assets/guidance/decline-bench-press-finish.webp') },
  'Dumbbell Press': { start: require('../../assets/guidance/dumbbell-bench-press-start.webp'), finish: require('../../assets/guidance/dumbbell-bench-press-finish.webp') },
  'Incline Dumbbell Press': { start: require('../../assets/guidance/incline-dumbbell-press-start.webp'), finish: require('../../assets/guidance/incline-dumbbell-press-finish.webp') },
  'Chest Fly': { start: require('../../assets/guidance/dumbbell-chest-fly-start.webp'), finish: require('../../assets/guidance/dumbbell-chest-fly-finish.webp') },
  'Cable Fly': { start: require('../../assets/guidance/cable-fly-start.webp'), finish: require('../../assets/guidance/cable-fly-finish.webp') },
  'Push-ups': { start: require('../../assets/guidance/push-ups-start.webp'), finish: require('../../assets/guidance/push-ups-finish.webp') },
  'Dips': { start: require('../../assets/guidance/dips-start.webp'), finish: require('../../assets/guidance/dips-finish.webp') },
  'Pec Deck': { start: require('../../assets/guidance/pec-deck-start.webp'), finish: require('../../assets/guidance/pec-deck-finish.webp') },
  'Kettlebell Floor Press': { start: require('../../assets/guidance/kettlebell-floor-press-start.webp'), finish: require('../../assets/guidance/kettlebell-floor-press-finish.webp') },
  'Kettlebell Pullover': { start: require('../../assets/guidance/kettlebell-pullover-start.webp'), finish: require('../../assets/guidance/kettlebell-pullover-finish.webp') },
  'Pike Push-ups': { start: require('../../assets/guidance/pike-push-ups-start.webp'), finish: require('../../assets/guidance/pike-push-ups-finish.webp') },
  'Diamond Push-ups': { start: require('../../assets/guidance/diamond-push-ups-start.webp'), finish: require('../../assets/guidance/diamond-push-ups-finish.webp') },
  'Pseudo Planche Push-ups': { start: require('../../assets/guidance/pseudo-planche-push-ups-start.webp'), finish: require('../../assets/guidance/pseudo-planche-push-ups-finish.webp') },
  'Muscle-ups': { start: require('../../assets/guidance/muscle-ups-start.webp'), finish: require('../../assets/guidance/muscle-ups-finish.webp') },
  'Deadlift': { start: require('../../assets/guidance/deadlift-start.webp'), finish: require('../../assets/guidance/deadlift-finish.webp') },
  'Pull-ups': { start: require('../../assets/guidance/pull-ups-start.webp'), finish: require('../../assets/guidance/pull-ups-finish.webp') },
  'Chin-ups': { start: require('../../assets/guidance/chin-up-start.webp'), finish: require('../../assets/guidance/chin-up-finish.webp') },
  'Lat Pulldown': { start: require('../../assets/guidance/lat-pulldown-start.webp'), finish: require('../../assets/guidance/lat-pulldown-finish.webp') },
  'Barbell Row': { start: require('../../assets/guidance/barbell-row-start.webp'), finish: require('../../assets/guidance/barbell-row-finish.webp') },
  'Dumbbell Row': { start: require('../../assets/guidance/dumbbell-row-start.webp'), finish: require('../../assets/guidance/dumbbell-row-finish.webp') },
  'T-Bar Row': { start: require('../../assets/guidance/t-bar-row-start.webp'), finish: require('../../assets/guidance/t-bar-row-finish.webp') },
  'Seated Cable Row': { start: require('../../assets/guidance/seated-cable-row-start.webp'), finish: require('../../assets/guidance/seated-cable-row-finish.webp') },
  'Face Pulls': { start: require('../../assets/guidance/face-pull-start.webp'), finish: require('../../assets/guidance/face-pull-finish.webp') },
  'Hyperextensions': { start: require('../../assets/guidance/hyperextension-start.webp'), finish: require('../../assets/guidance/hyperextension-finish.webp') },
  'Kettlebell Row': { start: require('../../assets/guidance/kettlebell-row-start.webp'), finish: require('../../assets/guidance/kettlebell-row-finish.webp') },
  'Kettlebell Deadlift': { start: require('../../assets/guidance/kettlebell-deadlift-start.webp'), finish: require('../../assets/guidance/kettlebell-deadlift-finish.webp') },
  'Kettlebell Renegade Row': { start: require('../../assets/guidance/kettlebell-renegade-row-start.webp'), finish: require('../../assets/guidance/kettlebell-renegade-row-finish.webp') },
  'Kettlebell Good Morning': { start: require('../../assets/guidance/kettlebell-good-morning-start.webp'), finish: require('../../assets/guidance/kettlebell-good-morning-finish.webp') },
  'Typewriter Pull-ups': { start: require('../../assets/guidance/typewriter-pull-ups-start.webp'), finish: require('../../assets/guidance/typewriter-pull-ups-finish.webp') },
  'Australian Pull-ups': { start: require('../../assets/guidance/australian-pull-ups-start.webp'), finish: require('../../assets/guidance/australian-pull-ups-finish.webp') },
  'Overhead Press': { start: require('../../assets/guidance/barbell-overhead-press-start.webp'), finish: require('../../assets/guidance/barbell-overhead-press-finish.webp') },
  'Dumbbell Shoulder Press': { start: require('../../assets/guidance/dumbbell-shoulder-press-start.webp'), finish: require('../../assets/guidance/dumbbell-shoulder-press-finish.webp') },
  'Arnold Press': { start: require('../../assets/guidance/arnold-press-start.webp'), finish: require('../../assets/guidance/arnold-press-finish.webp') },
  'Lateral Raises': { start: require('../../assets/guidance/lateral-raise-start.webp'), finish: require('../../assets/guidance/lateral-raise-finish.webp') },
  'Front Raises': { start: require('../../assets/guidance/dumbbell-front-raise-start.webp'), finish: require('../../assets/guidance/dumbbell-front-raise-finish.webp') },
  'Rear Delt Fly': { start: require('../../assets/guidance/seated-rear-delt-fly-start.webp'), finish: require('../../assets/guidance/seated-rear-delt-fly-finish.webp') },
  'Shrugs': { start: require('../../assets/guidance/dumbbell-shrug-start.webp'), finish: require('../../assets/guidance/dumbbell-shrug-finish.webp') },
  'Kettlebell Clean and Press': { start: require('../../assets/guidance/kettlebell-clean-and-press-start.webp'), finish: require('../../assets/guidance/kettlebell-clean-and-press-finish.webp') },
  'Wall Walk': { start: require('../../assets/guidance/wall-walk-start.webp'), finish: require('../../assets/guidance/wall-walk-finish.webp') },
  'Barbell Curl': { start: require('../../assets/guidance/barbell-curl-start.webp'), finish: require('../../assets/guidance/barbell-curl-finish.webp') },
  'Dumbbell Curl': { start: require('../../assets/guidance/dumbbell-curl-start.webp'), finish: require('../../assets/guidance/dumbbell-curl-finish.webp') },
  'Hammer Curl': { start: require('../../assets/guidance/hammer-curl-start.webp'), finish: require('../../assets/guidance/hammer-curl-finish.webp') },
  'Preacher Curl': { start: require('../../assets/guidance/preacher-curl-start.webp'), finish: require('../../assets/guidance/preacher-curl-finish.webp') },
  'Cable Curl': { start: require('../../assets/guidance/cable-curl-start.webp'), finish: require('../../assets/guidance/cable-curl-finish.webp') },
  'Tricep Dips': { start: require('../../assets/guidance/tricep-dips-start.webp'), finish: require('../../assets/guidance/tricep-dips-finish.webp') },
  'Close-grip Bench Press': { start: require('../../assets/guidance/close-grip-bench-press-start.webp'), finish: require('../../assets/guidance/close-grip-bench-press-finish.webp') },
  'Tricep Pushdown': { start: require('../../assets/guidance/tricep-pushdown-start.webp'), finish: require('../../assets/guidance/tricep-pushdown-finish.webp') },
  'Overhead Tricep Extension': { start: require('../../assets/guidance/overhead-tricep-extension-start.webp'), finish: require('../../assets/guidance/overhead-tricep-extension-finish.webp') },
  'Skull Crushers': { start: require('../../assets/guidance/skull-crushers-start.webp'), finish: require('../../assets/guidance/skull-crushers-finish.webp') },
  'Kettlebell Curl': { start: require('../../assets/guidance/kettlebell-curl-start.webp'), finish: require('../../assets/guidance/kettlebell-curl-finish.webp') },
  'Kettlebell Tricep Extension': { start: require('../../assets/guidance/kettlebell-tricep-extension-start.webp'), finish: require('../../assets/guidance/kettlebell-tricep-extension-finish.webp') },
  'Kettlebell Hammer Curl': { start: require('../../assets/guidance/kettlebell-hammer-curl-start.webp'), finish: require('../../assets/guidance/kettlebell-hammer-curl-finish.webp') },
  'Squat': { start: require('../../assets/guidance/barbell-back-squat-start.webp'), finish: require('../../assets/guidance/barbell-back-squat-finish.webp') },
  'Pause Squat': { start: require('../../assets/guidance/pause-squat-start.webp'), finish: require('../../assets/guidance/pause-squat-finish.webp') },
  'Front Squat': { start: require('../../assets/guidance/barbell-front-squat-start.webp'), finish: require('../../assets/guidance/barbell-front-squat-finish.webp') },
  'Leg Press': { start: require('../../assets/guidance/leg-press-start.webp'), finish: require('../../assets/guidance/leg-press-finish.webp') },
  'Leg Extension': { start: require('../../assets/guidance/leg-extension-start.webp'), finish: require('../../assets/guidance/leg-extension-finish.webp') },
  'Leg Curl': { start: require('../../assets/guidance/leg-curl-start.webp'), finish: require('../../assets/guidance/leg-curl-finish.webp') },
  'Romanian Deadlift': { start: require('../../assets/guidance/romanian-deadlift-start.webp'), finish: require('../../assets/guidance/romanian-deadlift-finish.webp') },
  'Lunges': { start: require('../../assets/guidance/dumbbell-lunge-start.webp'), finish: require('../../assets/guidance/dumbbell-lunge-finish.webp') },
  'Bulgarian Split Squat': { start: require('../../assets/guidance/bulgarian-split-squat-start.webp'), finish: require('../../assets/guidance/bulgarian-split-squat-finish.webp') },
  'Leg Abduction': { start: require('../../assets/guidance/leg-abduction-start.webp'), finish: require('../../assets/guidance/leg-abduction-finish.webp') },
  'Kettlebell Goblet Squat': { start: require('../../assets/guidance/kettlebell-goblet-squat-start.webp'), finish: require('../../assets/guidance/kettlebell-goblet-squat-finish.webp') },
  'Kettlebell Swing': { start: require('../../assets/guidance/kettlebell-swing-start.webp'), finish: require('../../assets/guidance/kettlebell-swing-finish.webp') },
  'Kettlebell Romanian Deadlift': { start: require('../../assets/guidance/kettlebell-romanian-deadlift-start.webp'), finish: require('../../assets/guidance/kettlebell-romanian-deadlift-finish.webp') },
  'Kettlebell Lunge': { start: require('../../assets/guidance/kettlebell-lunge-start.webp'), finish: require('../../assets/guidance/kettlebell-lunge-finish.webp') },
  'Kettlebell Sumo Deadlift': { start: require('../../assets/guidance/kettlebell-sumo-deadlift-start.webp'), finish: require('../../assets/guidance/kettlebell-sumo-deadlift-finish.webp') },
  'Kettlebell Single-Leg Deadlift': { start: require('../../assets/guidance/kettlebell-single-leg-deadlift-start.webp'), finish: require('../../assets/guidance/kettlebell-single-leg-deadlift-finish.webp') },
  'Pistol Squat': { start: require('../../assets/guidance/pistol-squat-start.webp'), finish: require('../../assets/guidance/pistol-squat-finish.webp') },
  'Jump Squat': { start: require('../../assets/guidance/jump-squat-start.webp'), finish: require('../../assets/guidance/jump-squat-finish.webp') },
  'High Knees': { start: require('../../assets/guidance/high-knees-start.webp'), finish: require('../../assets/guidance/high-knees-finish.webp') },
  'Box Jumps': { start: require('../../assets/guidance/box-jumps-start.webp'), finish: require('../../assets/guidance/box-jumps-finish.webp') },
  'Broad Jumps': { start: require('../../assets/guidance/broad-jumps-start.webp'), finish: require('../../assets/guidance/broad-jumps-finish.webp') },
  'Nordic Curl': { start: require('../../assets/guidance/nordic-curl-start.webp'), finish: require('../../assets/guidance/nordic-curl-finish.webp') },
  'Step-ups': { start: require('../../assets/guidance/step-ups-start.webp'), finish: require('../../assets/guidance/step-ups-finish.webp') },
  'Tuck Jump': { start: require('../../assets/guidance/tuck-jumps-start.webp'), finish: require('../../assets/guidance/tuck-jumps-finish.webp') },
  'Lateral Bound': { start: require('../../assets/guidance/lateral-bound-start.webp'), finish: require('../../assets/guidance/lateral-bound-finish.webp') },
  'Plank': { start: require('../../assets/guidance/plank.webp') },
  'Side Plank': { start: require('../../assets/guidance/side-plank.webp') },
  'Crunches': { start: require('../../assets/guidance/crunches-start.webp'), finish: require('../../assets/guidance/crunches-finish.webp') },
  'Bicycle Crunches': { start: require('../../assets/guidance/bicycle-crunches-start.webp'), finish: require('../../assets/guidance/bicycle-crunches-finish.webp') },
  'Russian Twists': { start: require('../../assets/guidance/russian-twists-start.webp'), finish: require('../../assets/guidance/russian-twists-finish.webp') },
  'Leg Raises': { start: require('../../assets/guidance/leg-raises-start.webp'), finish: require('../../assets/guidance/leg-raises-finish.webp') },
  'Hanging Leg Raises': { start: require('../../assets/guidance/hanging-leg-raises-start.webp'), finish: require('../../assets/guidance/hanging-leg-raises-finish.webp') },
  'Ab Wheel': { start: require('../../assets/guidance/ab-wheel-rollout-start.webp'), finish: require('../../assets/guidance/ab-wheel-rollout-finish.webp') },
  'Cable Crunches': { start: require('../../assets/guidance/cable-crunches-start.webp'), finish: require('../../assets/guidance/cable-crunches-finish.webp') },
  'Mountain Climbers': { start: require('../../assets/guidance/mountain-climbers-start.webp'), finish: require('../../assets/guidance/mountain-climbers-finish.webp') },
};

export const EXERCISE_GUIDANCE: Record<string, ExerciseGuidance> = Object.keys(GUIDANCE_COPY).reduce(
  (guidance, exerciseName) => {
    const [start, mid, finish, tips] = GUIDANCE_COPY[exerciseName];
    const images = IMAGE_SOURCES[exerciseName];
    guidance[exerciseName] = {
      frames: [
        { label: 'Start', caption: start, ...(images?.start ? { imageSource: images.start } : {}) },
        { label: 'Mid', caption: mid },
        { label: 'Finish', caption: finish, ...(images?.finish ? { imageSource: images.finish } : {}) },
      ],
      tips: [...tips],
    };
    return guidance;
  },
  {} as Record<string, ExerciseGuidance>,
);

/**
 * Checks the static catalog without ever blocking the app. This runs only in
 * development so a content mistake cannot crash a production user session.
 */
const INTENTIONAL_SHARED_EXERCISES = new Set([
  'Pike Push-ups',
  'Diamond Push-ups',
  'Muscle-ups',
  'Wall Walk',
]);

export function validateExerciseGuidance(): void {
  const canonicalNames: string[] = Object.values(EXERCISES).reduce<string[]>(
    (names, exercises) => names.concat(exercises.map((exercise) => exercise.name)),
    [],
  );
  const uniqueCanonicalNames = [...new Set(canonicalNames)];
  const duplicateCanonicalNames = canonicalNames.filter((name, index) => canonicalNames.indexOf(name) !== index);
  const guidanceNames = Object.keys(EXERCISE_GUIDANCE);
  const missing = uniqueCanonicalNames.filter((name) => !EXERCISE_GUIDANCE[name]);
  const stale = guidanceNames.filter((name) => !uniqueCanonicalNames.includes(name));
  const caseMismatches = guidanceNames.filter((name) => {
    const match = uniqueCanonicalNames.find(
      (canonical) => canonical.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0,
    );
    return !!match && match !== name;
  });
  const imageNames = Object.keys(IMAGE_SOURCES);
  const staleImageNames = imageNames.filter((name) => !uniqueCanonicalNames.includes(name));
  const imageCaseMismatches = imageNames.filter((name) => {
    const match = uniqueCanonicalNames.find(
      (canonical) => canonical.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0,
    );
    return !!match && match !== name;
  });
  const unexpectedDuplicateCanonicalNames = [...new Set(duplicateCanonicalNames)]
    .filter((name) => !INTENTIONAL_SHARED_EXERCISES.has(name));
  const invalidFrames = guidanceNames.filter((name) => {
    const frames = EXERCISE_GUIDANCE[name].frames;
    return frames.length !== 3 || frames.map((frame) => frame.label).join('|') !== 'Start|Mid|Finish' ||
      frames.some((frame) => !frame.caption.trim());
  });
  const invalidTips = guidanceNames.filter((name) => {
    const tips = EXERCISE_GUIDANCE[name].tips;
    return tips.length < 2 || tips.length > 4 || tips.some((tip) => !tip.trim());
  });

  const problems = [
    missing.length ? `missing guidance: ${missing.join(', ')}` : '',
    stale.length ? `stale guidance: ${stale.join(', ')}` : '',
    caseMismatches.length ? `case mismatches: ${caseMismatches.join(', ')}` : '',
    unexpectedDuplicateCanonicalNames.length
      ? `unexpected duplicate canonical names: ${unexpectedDuplicateCanonicalNames.join(', ')}`
      : '',
    staleImageNames.length ? `stale image keys: ${staleImageNames.join(', ')}` : '',
    imageCaseMismatches.length ? `image key case mismatches: ${imageCaseMismatches.join(', ')}` : '',
    invalidFrames.length ? `invalid frames/captions: ${invalidFrames.join(', ')}` : '',
    invalidTips.length ? `invalid tips: ${invalidTips.join(', ')}` : '',
  ].filter(Boolean);

  if (problems.length && typeof console !== 'undefined') {
    console.warn(`[exerciseGuidance] ${problems.join('; ')}`);
  }
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  validateExerciseGuidance();
}