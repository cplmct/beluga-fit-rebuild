# Beluga Fit — Production Readiness Audit

**Date:** May 2026  
**Build target:** Android APK (EAS / com.tranbtc.belugafitworkout)  
**TypeScript:** `npx tsc --noEmit` → **0 errors**

---

## Bugs Fixed This Session

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| 1 | `RegisterScreen.tsx` | Password min was 6 chars; `ResetPasswordScreen` required 8 — inconsistent | Changed to 8 everywhere (validation + placeholder) |
| 2 | `ProfileScreen.tsx` | "Height (inches)" / "Weight (lbs)" labels hardcoded regardless of unit system | Now reads `lengthUnit` / `weightUnit` from `UnitsContext` |
| 3 | `CalendarScreen.tsx` | `new Date('YYYY-MM-DD')` parsed as UTC midnight → wrong day label in non-UTC timezones | Uses `new Date(y, m-1, d)` (local time) for display label |

---

## Pending Manual Steps (not code)

| # | Action | Where |
|---|--------|-------|
| 1 | Run `supabase_notif_prefs_migration.sql` | Supabase SQL Editor (adds `notif_enabled`, `notif_hour`, `notif_minute`, `notif_type` to `profiles`) |
| 2 | Set `EXPO_PUBLIC_SUPABASE_ANON_KEY` as EAS secret | `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key>` |
| 3 | Set `EXPO_PUBLIC_SUPABASE_URL` as EAS secret | Same as above (already in .env for dev) |
| 4 | Set up Supabase `delete_user_account` RPC (service-role) | Supabase SQL Editor |
| 5 | Remove or gate `expo-dev-client` for store builds if desired | `app.json` plugins — currently harmless but adds DevMenu UI in debug builds |

---

## Architecture: Clean ✓

- **Auth flow**: `AuthContext` → `isPasswordRecovery` guard → `needsOnboarding` gate → main app. Session persisted via `AsyncStorage`, refreshed on `AppState` foreground.
- **Deep link**: `belugafit://` scheme + Android `intentFilters` for password reset. `ResetPasswordScreen` rendered outside `NavigationContainer` to avoid nesting issues.
- **Onboarding**: Supabase-backed (`profiles.onboarding_complete`). Shown once, re-accessible from Settings.
- **Active plan**: Cloud-persisted in `profiles.active_plan_id` + `profiles.active_plan_start_date` via `activePlan.ts`.
- **Units**: `UnitsContext` (metric/imperial) synced to `profiles.unit_system` via cloud. All display strings use `weightUnit`/`lengthUnit`.
- **Notifications**: `expo-notifications` + local scheduling + cloud backup to `profiles.notif_*` columns. Permission denied banner + device settings deeplink.
- **Account deletion**: Two-phase (review → email confirm), calls `delete_user_account` RPC, auto-navigates out on success via `onAuthStateChange`.

---

## Manual Test Checklist

Work through these flows on a **physical Android device** or signed APK.

### Auth

- [ ] **Register** — create account with email + password ≥8 chars → onboarding appears
- [ ] **Register** — try password < 8 chars → error "at least 8 characters"
- [ ] **Register** — mismatched passwords → error
- [ ] **Login** — valid credentials → main app
- [ ] **Login** — wrong password → error message, no crash
- [ ] **Forgot Password** — enter email → success message shown; check email for reset link
- [ ] **Password Reset deep link** — tap link in email → app opens `ResetPasswordScreen` (outside tab nav)
- [ ] **Password Reset** — enter new password < 8 chars → error; ≥8 chars → success → back to Login
- [ ] **Sign Out** — tapping Sign Out in Settings clears session, shows Login screen
- [ ] **Session persistence** — close and reopen app → stays logged in (no re-login required)

### Onboarding

- [ ] **First launch** — new user sees multi-step onboarding (goal, age, activity, units, plan choice)
- [ ] **Onboarding complete** — `profiles.onboarding_complete` = true; onboarding never shown again
- [ ] **Onboarding from Settings** — Settings → "Getting Started" → re-runs onboarding without logging out
- [ ] **Skip plan** — tapping Skip on the plan step goes to main app (Workout tab not forced)
- [ ] **Choose plan in onboarding** — navigates to Workout tab + PlanLibrary after complete

### Home Dashboard

- [ ] **Greeting and date** — correct greeting for time of day; current date shown
- [ ] **No workouts** — "No session logged yet" card shown; tapping navigates to Workout tab
- [ ] **After logging workout** — "Workout complete" card appears on dashboard, shows body parts + exercise count
- [ ] **Streak card** — correct streak count; dots for last 7 days; "View stats" link works
- [ ] **Active plan card** — shows plan name, week number, progress bar; tapping goes to PlanDetail
- [ ] **No active plan** — "No active plan" card shown; tapping goes to PlanLibrary
- [ ] **Body card** — shows latest weight with correct unit (kg or lbs); tapping goes to BodyTracker
- [ ] **Retry on error** — simulate airplane mode → error state with "Try Again" button; tapping reloads

### Workout Flow

- [ ] **Start Workout** → select body parts → select exercises → checklist loads
- [ ] **Templates** — choose a template → skips body/exercise selection → goes to checklist
- [ ] **Plan Library** — browse plans by category; filter works; tapping plan shows PlanDetail
- [ ] **Set Active Plan** — tap "Start Plan" on PlanDetail → plan appears on Home dashboard
- [ ] **WorkoutChecklist** — "Last time" badge shows previous weight/sets/reps for known exercises
- [ ] **Toggle exercises** — checkbox marks green; progress bar updates
- [ ] **Rest Timer** — opens to 60s default; presets (30/60/90s) work; Start/Pause/Reset work; vibrates on finish
- [ ] **Finish Workout** — saves to Supabase; shows duration + PR count; navigates to WorkoutDetails
- [ ] **PR detection** — set weight higher than any previous for that exercise → is_pr = true in DB
- [ ] **WorkoutDetails** — shows exercises, sets, reps, weights, PRs; delete button works

### History

- [ ] **History tab** — lists all workouts most-recent first; date, exercise count, body part tags shown
- [ ] **Pull-to-refresh** — swipe down updates list
- [ ] **Tap workout** → WorkoutDetails screen
- [ ] **Empty state** — no workouts → "No workouts logged yet" + "Start a Workout" CTA
- [ ] **Error state** — offline → error with "Try Again"

### Calendar

- [ ] **Dots on workout days** — days with workouts show blue dot
- [ ] **Tap a workout day** — correct date shown (verify day is right, not UTC-shifted); workout cards appear
- [ ] **Tap empty day** — "No workouts on this day" + "Log a Workout" CTA
- [ ] **Tap workout card** → WorkoutDetails

### Body Tracker & Stats

- [ ] **Log measurement** — weight, body fat, etc. saved; labels show correct unit (kg/lbs, cm/in)
- [ ] **Charts update** after logging
- [ ] **Stats screen** — streak, weekly count, total workouts, PRs shown; refreshes when focused

### Settings

- [ ] **Profile card** shows correct name/email/member-since
- [ ] **Edit profile** — change display name → saves → reflected in Settings and Home
- [ ] **Height/Weight labels** — match current unit system (lbs/kg, in/cm)
- [ ] **Unit toggle** — switching metric/imperial updates labels in Profile, Body Tracker, Workout Checklist
- [ ] **Notifications OFF** — no notification scheduled; Settings shows "Off"
- [ ] **Notifications ON** — permission prompt appears on first enable; scheduled; Settings shows time
- [ ] **Notification time/style** — change time → reschedules; change style → updates
- [ ] **Permission denied** — yellow banner + "Open Settings" deeplink shown when notifications blocked
- [ ] **Cloud sync** — install on second device; notification prefs restore (requires migration SQL run)
- [ ] **Privacy Policy** — opens in-app
- [ ] **Terms of Use** — opens in-app
- [ ] **Support & Contact** — opens in-app
- [ ] **App version** shown correctly at bottom of Settings

### Account Deletion

- [ ] **Review phase** — stats (workouts, days active, last measurement) load; data list shown
- [ ] **Continue** → phase 2: email confirm input appears with autofocus
- [ ] **Wrong email** — Delete button stays disabled
- [ ] **Correct email** — Delete button enables (red border on input)
- [ ] **Delete** — account + all data removed; app navigates to Login automatically
- [ ] **Cancel** — returns to review phase; account unaffected

### Deep Link / Password Reset

- [ ] Email reset link opens app (not browser)
- [ ] After password reset, tapping "Back to Login" (or success auto-redirect) shows Login screen
- [ ] Reset flow renders outside the tab navigator (no back button into settings)

---

## Known Non-Issues (intentional)

- `expo-dev-client` is a production dependency — fine for EAS; adds DevMenu on dev builds only
- Supabase anon key is public-facing by design (Row Level Security enforces data access)
- `console.log` calls are guarded with `__DEV__` throughout — no leaks in production builds
- `any` navigation params use `any` type — acceptable for RN navigation until full typed nav is added
