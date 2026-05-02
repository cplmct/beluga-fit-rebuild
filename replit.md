# Beluga Fit

A React Native / Expo fitness tracker app focused on structured pre-built workout plans, custom workouts, body measurements, and detailed progress monitoring. Runs on web via Expo Web.

## Architecture

- **Framework**: Expo (v52) + React Native
- **Language**: TypeScript
- **Backend/Auth/DB**: Supabase (hosted, remote)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Package Manager**: npm

## Project Structure

```
/
├── App.tsx                  # Root entry point (AuthProvider + NavigationContainer)
├── app.json                 # Expo static configuration
├── babel.config.js          # Babel with expo preset and react-native-dotenv
├── assets/                  # Icons, splash screens, favicon
├── src/
│   ├── components/          # All screen components and navigators
│   ├── contexts/            # React context providers (AuthContext)
│   ├── data/                # Static data (exercises, workout templates)
│   ├── lib/                 # Library setup (supabase.ts, safeSupabase.ts)
└── supabase/
    └── migrations/          # SQL schema migrations
```

## Environment Variables

Set in `.env` file (loaded via react-native-dotenv):
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key

These are also embedded in `app.json` under `extra` for use via `expo-constants`.

## Running the App

The app runs via the "Start application" workflow using:
```
npx expo start --web --port 5000
```

Users can also scan the QR code shown in the terminal with Expo Go to preview on a physical device.

## Key Features

- Auth flow (login / register) via Supabase Auth
- Home screen dashboard (quick links to all core features)
- Workout tracking: pre-built plans + custom workout builder
- Exercise library (60+ exercises across 6 body parts)
- Rest timer with presets
- Calendar view of workout history
- Workout history with detailed exercise breakdowns
- Body tracker with measurement logging and trend charts
- Settings with profile management and account deletion

## Navigation Structure

```
BottomTabNavigator
├── Home → HomeStackNavigator
│   ├── HomeScreen (dashboard)
│   └── BodyTrackerScreen
├── Workout → WorkoutStackNavigator
│   ├── StartWorkoutScreen (Use a Plan | Custom Workout)
│   ├── WorkoutTemplatesScreen
│   ├── BodyPartsScreen
│   ├── ExercisesScreen
│   ├── WorkoutChecklistScreen
│   ├── WorkoutDetailsScreen
│   └── RestTimerScreen
├── Calendar → CalendarStackNavigator
├── History → HistoryStackNavigator
└── Settings → SettingsStackNavigator
    ├── SettingsScreen
    └── LegalScreen
```

## Database Tables (Supabase)

- `workouts` — user workout sessions
- `workout_exercises` — exercises within each session
- `body_measurements` — weight, waist, chest, etc. (scoped by user_id)
- `profiles` — user profile (name, age, gender, height, weight)
- `ai_workout_plans` — orphaned after Phase 1 cleanup; table exists in DB but is no longer used

## Phase History

### Phase 1 (Complete) — AI/Voice Cleanup
- Deleted: AICoachScreen, AIWorkoutScreen, VoiceButton, VoicePreviewScreen, useVoiceRecognition, voiceCommandParser, supabase/functions/generate-workout-plan
- Removed AIWorkout route from WorkoutStackNavigator
- Removed AICoach and VoicePreview routes from HomeStackNavigator
- Removed AI Workout option from StartWorkoutScreen
- Removed VoiceButton from WorkoutChecklistScreen and BodyTrackerScreen
- Fixed BodyTrackerScreen: added `.eq('user_id', user.id)` to measurements query
- Fixed App.tsx: removed duplicate Supabase client and debug console.logs
- Fixed LegalScreen: changed from default export to named export
- Removed RECORD_AUDIO and CAMERA permissions from AndroidManifest
- Updated app.json description to remove AI/voice copy

## Deployment

Configured as a static site deployment:
- Build: `npm run build:web` (Expo web export → `dist/`)
- Serves the `dist/` directory statically
