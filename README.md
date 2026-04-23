# On the GO

## What the app does
On the GO is a group travel planning app built to simplify collaborative trip planning. It combines profile management, trip creation, itinerary building, crew invites, swipe-based activity voting, and a shared calendar into one mobile experience.

The app uses Supabase for authentication, user profiles, and real-time data sync, while local storage keeps itinerary progress and votes available offline.

## Screens and user flow
1. **Loading screen** (`app/index.tsx`): shows the brand logo briefly, checks auth state, then navigates to sign-in or the main trip dashboard.
2. **Sign in / Sign up** (`app/sign-in.tsx`): users can start with email OTP or optionally sign in with Google or Apple if Supabase is configured.
3. **Verify OTP** (`app/verify-otp.tsx`): input a 6-digit code sent by email to complete authentication.
4. **Choose trip / profile dashboard** (`app/choose-trip.tsx`): edit username and avatar, create a new trip, or continue with saved trips.
5. **Saved trips** (`app/saved-trips.tsx`): search, open, and delete existing trips.
6. **Onboarding trip setup** (`app/(onboarding)/trip-name.tsx`): enter a trip name, dates, and metadata.
7. **Invite collaborators (onboarding)** (`app/(onboarding)/invite-collaborators.tsx`): add crew members during trip setup.
8. **Choose destination** (`app/(onboarding)/choose-destination.tsx`): pick a destination for the trip.
9. **Itinerary** (`app/itinerary.tsx`): add activities, attach files/photos, expand/collapse itinerary items, and persist them locally.
10. **Voting tutorials** (`app/vote-tutorial-1.tsx`, `app/vote-tutorial-2.tsx`): explain swipe gestures for like, dislike, and skip.
11. **Vote on activities** (`app/vote.tsx`): swipe right to like, left to dislike, and up to skip each activity. Results are cached locally and synced to Supabase.
12. **All voted** (`app/all-voted.tsx`): shown when the user completes voting on all activities.
13. **Calendar** (`app/calendar.tsx`): displays activity dates, marks planned days, and opens a daily view when a date is selected.
14. **Calendar day** (`app/calendar-day.tsx`): shows the itinerary items scheduled for the selected date.
15. **Invite crew** (`app/invite.tsx`): share a trip code, send email invites, and manage collaborator entries.
16. **Profile** (`app/profile.tsx`): view/edit name and avatar, see trip stats, and access settings.
17. **Past trips** (`app/past-trips.tsx`): review previously saved journeys.

## Setup and run
### Prerequisites
- Node.js (LTS)
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- Optional: Expo Go for device testing

### Install
```bash
git clone <your-repo-url>
cd on-the-go
npm install
```

### Environment variables
Copy `.env.example` to `.env` and set the required values:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your-unsplash-access-key-here
```

> Note: the codebase currently uses Supabase and Unsplash. `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` is not required for the current implementation.

### Run
```bash
npx expo start
```

### Optional native dependency sync
If you need to reinstall native Expo dependencies, use:
```bash
npx expo install expo-secure-store expo-document-picker expo-image-picker expo-notifications expo-background-fetch expo-task-manager expo-apple-authentication expo-auth-session expo-web-browser react-native-calendars @react-native-community/datetimepicker @react-native-async-storage/async-storage react-native-reanimated react-native-gesture-handler
```

## Notes on the current implementation
- Supabase handles auth, profile updates, storage, and real-time vote sync.
- Local persistence is used for itinerary items and voting progress via `AsyncStorage`.
- Background tasks and push notifications are registered in `app/_layout.tsx`.
- Unsplash is used for activity and destination images.
- A dev fallback bypasses auth when Supabase is not configured so the app can still be previewed.

## One thing learned
Mobile apps require connecting many moving pieces: auth, offline caching, real-time sync, file attachments, and onboarding flows must all work together cleanly. That makes a solid app spec and clear screen flow essential to avoid bugs and keep the experience cohesive.
