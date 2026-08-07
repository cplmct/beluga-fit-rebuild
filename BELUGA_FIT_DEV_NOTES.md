# Beluga Fit — Developer Notes

## Project Overview
React Native fitness tracking app built with Expo SDK 53, TypeScript, and Supabase.
- **Package**: com.belugafit.app
- **GitHub**: https://github.com/cplmct/beluga-fit-rebuild
- **Google Play**: Internal testing active
- **Supabase Project**: zsjotudjdosikvysbzlw.supabase.co

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 53 |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | AsyncStorage + Supabase |
| Build | EAS (Expo Application Services) |
| CI/CD | GitHub + Replit + EAS Cloud |
| Platform | Android (Google Play), iOS planned |

---

## Development Workflow
1. Code changes made in **Replit**
2. Replit pushes to **GitHub** (main branch)
3. Local Windows machine pulls from GitHub via PowerShell
4. EAS builds triggered from local machine: `eas build --platform android --profile production`
5. AAB downloaded from expo.dev and uploaded manually to Google Play Console
6. Git cannot push from Replit main agent — always push from Replit Shell tab

### Build Commands
```powershell
# Production build (AAB for Google Play)
eas build --platform android --profile production

# Preview build (APK for direct install)
eas build --platform android --profile preview

# Development build
eas build --platform android --profile development
```

### EAS Configuration Notes
- Node version must be 22+ in eas.json (`"node": "22.0.0"` on all profiles)
- Production buildType must be `"app-bundle"` NOT `"apk"`
- `autoIncrement: true` on production profile
- Supabase keys stored in eas.json env block

---

## Database Schema (Post-Migration — July 2026)

### Migration Summary
A full database schema migration was completed in July 2026. The old tables
(`workouts`, `workout_exercises`, `ai_workout_plans`) were replaced with a
properly normalized schema. Old tables preserved as backup — not yet dropped.

### Table Mapping (Old → New)
| Old Table | New Table(s) |
|-----------|-------------|
| workouts | workout_sessions |
| workout_exercises | session_exercises + session_sets |
| ai_workout_plans | workout_templates |

### Reference Tables (No User Data)
```sql
exercise_categories  -- strength, cardio, flexibility, balance, plyometrics, bodyweight
muscle_groups        -- chest, back, shoulders, biceps, triceps, etc. + high-level (Legs, Arms, Core)
equipment            -- barbell, dumbbell, kettlebell, cable machine, etc.
exercises            -- 88 exercises, Title Case names (see naming rules below)
exercise_muscle_groups  -- 242 mappings (exercise → muscle group, is_primary flag)
exercise_equipment   -- exercise → equipment junction table
```

### User Data Tables
```sql
workout_sessions     -- one row per completed workout
session_exercises    -- one row per exercise within a session
session_sets         -- one row per SET (weight_kg, reps, is_completed, is_pr)
workout_templates    -- saved workout plans
workout_template_exercises  -- exercises within a template
personal_records     -- current best PR per user per exercise per type
session_muscle_groups  -- muscle groups worked in a session (replaces body_parts array)
plan_equipment       -- equipment used in a plan (replaces available_equipment array)
body_measurements    -- unchanged from original schema
profiles             -- unchanged from original schema
```

### Key Schema Details
```sql
-- workout_sessions
status: 'in_progress' | 'completed' | 'cancelled'
started_at: TIMESTAMPTZ  -- use this for date filtering (replaces old 'date' column)
duration_seconds: INTEGER

-- session_sets
weight_kg: NUMERIC(6,2)  -- always in KG regardless of user's display preference
reps: INTEGER
is_completed: BOOLEAN
is_pr: BOOLEAN  -- weight-based PR flag

-- personal_records
record_type: 'max_weight' | 'max_reps' | 'max_volume' | 'max_duration'
UNIQUE constraint on (user_id, exercise_id, record_type)
```

### RLS Policies
RLS is active on ALL user data tables. Reference tables (exercises, muscle_groups,
equipment, exercise_categories) have public read access. Always use authenticated
Supabase client — anon key will be blocked from reading user data.

### Indexes
```sql
idx_workout_sessions_user_id
idx_workout_sessions_user_status
idx_workout_sessions_started_at
idx_session_exercises_session_id
idx_session_sets_session_exercise_id
idx_session_sets_is_pr
idx_workout_templates_user_id
idx_exercises_name  -- GIN index for text search
idx_personal_records_user_exercise
idx_body_measurements_user_id
idx_body_measurements_created_at
```

---

## Exercise Library

### CRITICAL NAMING RULE
**Exercise names in the database are Title Case and MUST match the static
`src/data/exercises.ts` file exactly.**

- ✅ Correct: `"Bench Press"`, `"Squat"`, `"T-Bar Row"`
- ❌ Wrong: `"bench press"`, `"squat"`, `"t-bar row"`

**Do NOT use `.toLowerCase()` when querying exercises by name.**
The `.in('name', exerciseNames)` query is case-sensitive in PostgreSQL.

### Why This Rule Exists
The exercises table was originally seeded with lowercase names during the
July 2026 migration. This caused a case mismatch with the Title Case static
data, causing exercises to silently drop when saving workouts. The fix was
to UPDATE all 42 lowercase names to Title Case in August 2026. The code
must now use exact matching without case transformation.

### Exercise Count
- 88 total exercises across 6 body part categories
- 242 muscle group mappings
- Categories: Chest, Back, Shoulders, Arms, Legs, Core

### Database-Only Exercises (not in static library)
- burpees
- high knees
- jumping jacks

These were seeded from historical workout data and remain in the DB.

---

## Code Architecture

### Key Files
src/
components/
WorkoutChecklistScreen.tsx -- workout logging, saves to session_exercises + session_sets
HistoryScreen.tsx -- reads from workout_sessions + session_muscle_groups
CalendarScreen.tsx -- reads from workout_sessions
WorkoutDetailsScreen.tsx -- reads from session_exercises + session_sets + exercises
HomeScreen.tsx -- dashboard stats from workout_sessions
StatsScreen.tsx -- aggregated stats from workout_sessions + session_exercises
PRHistoryScreen.tsx -- reads from personal_records (NOT session_sets)
ExerciseDetailScreen.tsx -- PR history + session progression per exercise
ProfileScreen.tsx -- profiles + workout_sessions
DeleteAccountScreen.tsx -- reads workout_sessions for pre-deletion summary
HistoryStackNavigator.tsx -- navigation stack including ExerciseDetail
data/
exercises.ts -- static exercise library (Title Case names)
exerciseGuidance.ts -- form guidance per exercise
utils/
notifications.ts -- inactivity reminder, reads workout_sessions
goalPrefs.ts -- countWorkoutsThisWeek utility
lib/
supabase.ts -- Supabase client (authenticated, persistSession: true)

text

### WorkoutChecklistScreen Save Flow
Filter exercises with weights → exercisesWithWeights

Fetch max weights from session_sets (PR detection)

Fetch exercise IDs: .from('exercises').select('id, name').in('name', exerciseNames)
⚠️ exerciseNames must be Title Case — DO NOT toLowerCase()

Build nameToExId map using row.name as key (not lowercased)

Fetch current personal_records for comparison

INSERT workout_sessions row

Filter validExercises (those found in nameToExId)

INSERT session_exercises rows

INSERT session_sets rows (one per set)

UPSERT personal_records for new PRs

Show completion alert with PR names

text

### Navigation Structure
BottomTabNavigator
├── HomeStack → HomeScreen
├── WorkoutStack → BodyPartScreen → ExercisesScreen → WorkoutChecklistScreen
├── CalendarStack → CalendarScreen → WorkoutDetailsScreen
├── HistoryStack → HistoryScreen → WorkoutDetailsScreen
│ → PRHistoryScreen → ExerciseDetailScreen
└── ProfileStack → ProfileScreen → BodyMeasurementsScreen → etc.

text

---

## Personal Records System

### How PRs Work
1. During workout save, compare new weight against historical max in `session_sets`
2. If new weight > historical max → `session_sets.is_pr = true` for set 1
3. UPSERT `personal_records` with new max_weight and max_reps values
4. `personal_records` uses UPSERT with `ON CONFLICT (user_id, exercise_id, record_type)`

### PR History Screen
- Reads directly from `personal_records` table (NOT session_sets)
- Groups by exercise — shows both max_weight and max_reps chips per exercise card
- Tapping a card navigates to ExerciseDetailScreen

### Exercise Detail Screen
- Shows current PRs from `personal_records`
- Shows weight progression (last 10 sessions ascending)
- Shows full session history with set-by-set breakdown

---

## Splash Screen Configuration

### Current Working Config (app.json)
```json
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "cover",
  "backgroundColor": "#091722"
},
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#091722"  ← must match splash background
  },
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "cover",
    "backgroundColor": "#091722"
  }
},
"plugins": [
  ["expo-splash-screen", {
    "backgroundColor": "#091722",
    "image": "./assets/splash.png",
    "resizeMode": "cover",
    "imageWidth": 400
  }]
]
```

### Splash Screen Notes
- `adaptiveIcon.backgroundColor` MUST match `splash.backgroundColor`
  If different, a colored box border appears around the logo during Phase 1
- `imageWidth: 400` controls the OS-controlled Phase 1 splash icon size
- Two phases are normal on Android 12+: OS splash (Phase 1) → JS splash (Phase 2)
- Splash is a native asset — changes require a full EAS rebuild

---

## Known Issues Fixed

### 1. Exercise Name Case Mismatch (Fixed August 2026)
- **Symptom**: Only PR exercises saved, others silently dropped
- **Root cause**: DB had lowercase names, static data had Title Case
- **Fix 1**: Added `.toLowerCase()` to code lookups (July 2026)
- **Fix 2**: Updated DB names to Title Case (August 2026)
- **Fix 3**: Removed `.toLowerCase()` from code since names now match exactly
- **Current state**: DB and static data match exactly — no case transformation needed

### 2. No Foreign Key Constraints (Fixed July 2026)
- Old schema had no FK constraints — orphaned data was possible
- New schema has proper FKs with CASCADE deletes

### 3. No RLS Policies (Fixed July 2026)
- Old schema had no RLS — user data was accessible to any authenticated user
- New schema has RLS on all user data tables

### 4. exercise_muscle_groups Empty (Fixed July 2026)
- Body part chips showed blank after migration
- Fixed by seeding 242 exercise-to-muscle-group mappings

### 5. Splash Screen Oversized (Fixed July 2026)
- `adaptiveIcon.backgroundColor: "#ffffff"` caused white box on dark splash
- Missing Android splash config caused native-resolution rendering
- Fixed with imageWidth, cover mode, and matching background colors

### 6. EAS Build Node Version (Fixed July 2026)
- `@supabase/auth-js@2.110.3` requires Node 22+
- EAS was using Node 20 by default
- Fixed by adding `"node": "22.0.0"` to all profiles in eas.json

### 7. @expo/vector-icons Version (Fixed July 2026)
- After deleting node_modules, npm installed incompatible v15.1.1
- SDK 53 requires v14.1.0
- Fixed by running `npx expo install --fix`

---

## Backup Tables (Safe to Drop When Ready)
```sql
workouts_backup
workout_exercises_backup
ai_workout_plans_backup
profiles_backup
body_measurements_backup
```

## Legacy Tables (Still Exist — Do Not Use)
```sql
workouts          -- old workout sessions table
workout_exercises -- old exercise tracking table
ai_workout_plans  -- orphaned, 0 rows, safe to drop
```

---

## Google Play

### App Details
- Package: `com.belugafit.app`
- Current track: Internal Testing
- Target SDK: 35 (Android 15) — compliant with Aug 31 2026 deadline
- Signing: Google Play App Signing

### Build & Release Process
1. `eas build --platform android --profile production` → generates AAB
2. Download AAB from expo.dev
3. Google Play Console → Beluga Fit → Testing → Internal Testing
4. Create new release → Upload AAB → Add release notes → Review → Rollout

---

## Environment Variables
EXPO_PUBLIC_SUPABASE_URL=https://zsjotudjdosikvysbzlw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[stored in eas.json env blocks]

text

---

# - 24 calisthenics exercises added
# - Challenge system tables and screens
# - 10 seeded challenges

---

## Remaining Tasks
| Priority | Task |
|----------|------|
| 🟡 Medium | Drop legacy backup tables when confident |
| 🟡 Medium | Drop ai_workout_plans orphaned table |
| 🟡 Medium | Upgrade React Navigation v6 → v7 (deprecated) |
| 🟢 Low | PR push notification when new record is set |
| 🟢 Low | iOS build and App Store submission |
| 🟢 Low | Seed exercise_equipment junction table |
