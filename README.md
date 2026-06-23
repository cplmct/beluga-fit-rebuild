# Beluga Fit

A structured fitness tracking app built with Expo / React Native and backed by Supabase. Beluga Fit helps users follow curated workout plans, track their progress, and achieve their fitness goals.

## Current Status

- **Branch**: `ai/claude-review-workspace` (AI-assisted review workspace)
- **App Version**: 1.0.0
- **Status**: Near-launch, production-ready

## Core Features

- **Auth & Onboarding**: Email/password authentication with Supabase, user onboarding flow
- **Workout Plans**: 15+ pre-built workout plans across 6 categories (weight loss, muscle gain, strength, general fitness, beginner, home)
- **Active Workouts**: Real-time workout tracking with exercise checklists, rest timer, and session resume capability
- **Progress Tracking**: Body measurements (weight, chest, waist, hips, arms, thighs, calves, neck) with trend visualization
- **History & Stats**: Workout history with detailed exercise breakdown, progress statistics and streak tracking
- **Notifications**: Daily workout reminders and inactivity nudges
- **Settings**: Profile management, unit system (metric/imperial), weekly workout goals, account deletion

## Tech Stack

- **Frontend**: Expo SDK 53, React Native 0.79.6, TypeScript 5.8
- **Navigation**: React Navigation 6.x (Stack + Bottom Tabs)
- **Backend/Auth/Database**: Supabase (PostgreSQL, Row Level Security)
- **State Management**: React Context (AuthContext, UnitsContext)
- **Persistence**: AsyncStorage for local session state
- **Notifications**: expo-notifications
- **Charts**: react-native-chart-kit, react-native-calendars

## Project Structure

```
beluga-fit-replit-CL-Rev/
├── App.tsx                     # Root entry point with providers
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── tsconfig.json               # TypeScript configuration
├── assets/                     # App icons, splash screens
├── src/
│   ├── components/             # Screen components and navigators
│   │   ├── HomeScreen.tsx      # Dashboard with streak/plans
│   │   ├── WorkoutChecklistScreen.tsx  # Active workout UI
│   │   ├── CalendarScreen.tsx  # Workout history calendar
│   │   ├── HistoryScreen.tsx   # Workout history list
│   │   ├── SettingsScreen.tsx  # App settings
│   │   ├── AuthStackNavigator.tsx
│   │   ├── HomeStackNavigator.tsx
│   │   ├── WorkoutStackNavigator.tsx
│   │   └── ... (30+ screen components)
│   ├── contexts/               # React context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── UnitsContext.tsx    # Unit system preferences
│   ├── data/                   # Static data
│   │   ├── exercises.ts        # Exercise library (60+ exercises)
│   │   ├── workoutPlans.ts     # 15 curated workout plans
│   │   └── workoutTemplates.ts # Quick-start templates
│   ├── lib/                    # Core utilities
│   │   ├── supabase.ts         # Supabase client setup
│   │   └── safeSupabase.ts     # Query error handling wrapper
│   ├── hooks/                  # Custom React hooks
│   │   └── useSaveStatus.ts    # Save confidence indicator
│   └── utils/                  # Utility functions
│       ├── activePlan.ts       # Active plan state management
│       ├── workoutSession.ts   # In-progress workout persistence
│       ├── notifications.ts    # Push notification scheduling
│       ├── goalPrefs.ts        # Weekly goal preferences
│       └── haptics.ts          # Haptic feedback helper
├── supabase/
│   ├── migrations/             # Database schema migrations (7 migrations)
│   │   ├── create_profiles_table.sql
│   │   ├── create_workouts_tables.sql
│   │   ├── create_body_measurements_table.sql
│   │   ├── create_ai_workout_plans_table.sql
│   │   ├── fix_rls_performance_and_security.sql
│   │   └── create_delete_user_function.sql
│   └── config.toml             # Supabase local dev config
└── docs/                       # Documentation
    ├── ARCHITECTURE.md         # System architecture notes
    ├── ROADMAP.md              # Future feature plans
    └── CHANGELOG_AI.md         # AI-assisted change log
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm 10.8.2+
- Expo CLI
- Supabase account (for backend)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd beluga-fit-replit-CL-Rev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     EXPO_PUBLIC_SUPANZE_ANON_KEY=your-anon-key
     ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Run on a platform:
   ```bash
   npm run android    # Android device/emulator
   npm run ios        # iOS device/simulator
   npm run web        # Web browser
   ```

### Build for Production

Using EAS Build:
```bash
eas build --platform android  # or ios
```

## Database Schema

### Tables
- `profiles` - User profile data (name, email, unit_system, active_plan_id)
- `workouts` - Workout sessions (date, body_parts, duration_seconds)
- `workout_exercises` - Individual exercises (exercise_name, body_part, sets, reps, weight, completed, is_pr)
- `body_measurements` - Body measurements (weight, height, chest, waist, etc.)
- `ai_workout_plans` - AI-generated plans (legacy table, currently unused)

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure account deletion via `delete_user()` function

## Navigation Structure

```
Bottom Tab Navigator
├── Home
│   ├── HomeScreen (dashboard)
│   ├── BodyTrackerScreen
│   └── StatsScreen
├── Workout
│   ├── StartWorkoutScreen
│   ├── PlanLibraryScreen
│   ├── PlanDetailScreen
│   ├── WorkoutChecklistScreen
│   ├── RestTimerScreen
│   └── WorkoutDetailsScreen
├── Calendar
│   └── CalendarScreen
├── History
│   ├── HistoryScreen
│   └── WorkoutDetailsScreen
└── Settings
    ├── SettingsScreen
    ├── ProfileScreen
    ├── NotificationSettingsScreen
    └── DeleteAccountScreen
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS device/simulator |
| `npm run web` | Run on web browser |
| `npm run build:web` | Build static web version |
| `npm run type-check` | Run TypeScript type checking |

## Known Issues / Next Steps

- Type definitions being progressively added for React Navigation props (current phase work)
- `ai_workout_plans` table exists but is no longer used (orphaned from previous AI feature)
- Consider adding workout weight entry UI for progressive overload tracking
- Token caching behavior could be surfaced in UI settings

## Configuration

### Expo Configuration (app.json)
- App slug: `beluga-fit`
- Custom scheme: `belugafit` (for deep linking)
- Android: SDK 35, Kotlin 2.1.0
- iOS: Deployment target 16.0

### Supabase Configuration
- RLS enabled on all tables
- Email confirmation disabled for development
- Minimum password length: 6 characters

## License

Proprietary - Beluga Fit