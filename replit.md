# Beluga Fit

A React Native / Expo fitness tracker app with AI-powered coaching, voice commands, and detailed progress monitoring. Runs on web via Expo Web.

## Architecture

- **Framework**: Expo (v52) + React Native
- **Language**: TypeScript
- **Backend/Auth/DB**: Supabase (hosted, remote)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Package Manager**: npm

## Project Structure

```
/
├── App.tsx                  # Root entry point
├── app.json                 # Expo static configuration
├── babel.config.js          # Babel with expo preset and react-native-dotenv
├── assets/                  # Icons, splash screens, favicon
├── src/
│   ├── components/          # All screen components and navigators
│   ├── contexts/            # React context providers (AuthContext)
│   ├── data/                # Static data (exercises, workout templates)
│   ├── hooks/               # Custom hooks (useVoiceRecognition)
│   ├── lib/                 # Library setup (supabase.ts, safeSupabase.ts)
│   └── utils/               # Helper functions (voiceCommandParser)
└── supabase/
    ├── migrations/          # SQL schema migrations
    └── functions/           # Supabase Edge Functions (Deno)
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
- Home screen with workout dashboard
- Workout tracking with exercise library
- AI Coach screen with Supabase Edge Function integration
- Voice command support
- Calendar / history tracking
- Body tracker and measurements
- Settings with account management

## Deployment

Configured as a static site deployment:
- Build: `npm run build:web` (Expo web export → `dist/`)
- Serves the `dist/` directory statically
