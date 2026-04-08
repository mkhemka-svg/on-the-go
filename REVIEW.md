# On the GO! — Code Review

Reviewed against SPEC-2.md. Each finding is marked [PASS], [FAIL], or [WARN].

---

## 1. Authentication (Spec §Feature 1)

**1.1** [PASS] Sign in / sign up via email OTP is implemented with full loading state and error handling.
— `app/sign-in.tsx:42–71`

**1.2** [PASS] Continue with Google is implemented via Supabase OAuth + `expo-web-browser` PKCE flow.
— `app/sign-in.tsx:77–113`

**1.3** [PASS] Continue with Apple is implemented and conditionally shown only when the device supports it.
— `app/sign-in.tsx:119–152`, `app/sign-in.tsx:230`

**1.4** [FAIL] The loading screen (`app/index.tsx:17–19`) always navigates to `/sign-in` after 2.5 s regardless of whether a session already exists. A returning user is never auto-routed to `/choose-trip`. The spec implies the app should resume a session on launch.

**1.5** [FAIL] After successful Google or Apple sign-in, the code navigates to `/choose-trip` (`app/sign-in.tsx:105`, `app/sign-in.tsx:144`) but never queries Supabase for an existing session on app restart. There is no `onAuthStateChange` listener or session restore anywhere in the app.

**1.6** [WARN] The dev-bypass that skips auth when `EXPO_PUBLIC_SUPABASE_URL` is unset (`app/sign-in.tsx:47–53`) is also present identically in the Google and Apple handlers (lines 79–83, 122–126). This is duplicated logic that should live in one place (e.g. a shared `isSupabaseConfigured()` helper).

**1.7** [FAIL] Email is not validated before calling `signInWithOtp`. The check on line 154 (`email.trim().length > 0`) only ensures the field is non-empty, not that it is a valid email address. A malformed email will fail at the Supabase call with a confusing API error rather than a clear inline message.

**1.8** [WARN] `app/verify-otp.tsx` exists and handles resend / confirm UI, but the actual Supabase `verifyOtp` call is not wired. Comment says "TODO: wire up". The OTP screen is reachable but non-functional when Supabase is configured.

---

## 2. Trip Creation — 3-Step Flow (Spec §Feature 2)

**2.1** [PASS] Step 1 (Trip Name + Dates) is implemented with required-field validation, date pickers, and next/back navigation.
— `app/(onboarding)/trip-name.tsx`

**2.2** [PASS] Step 2 (Invite Crew via trip code or email) is implemented. Trip code is auto-generated via `generateTripCode()`, which uses a cryptographically weak `Math.random()`.
— `components/InviteShared.tsx`

**2.3** [WARN] Trip code uses `Math.random()` (`components/InviteShared.tsx`). For a code that grants trip access, this should use `crypto.getRandomValues()` or be generated server-side (Supabase function). An adversary could enumerate or predict short codes.

**2.4** [PASS] Step 3 (Choose Destination) is implemented with a 10-destination trending grid, custom input, and selection state.
— `app/(onboarding)/choose-destination.tsx`

**2.5** [FAIL] No trip data is ever saved to Supabase. The `handleNext` function in `choose-destination.tsx:165–172` has a `// TODO: save trip to Supabase` comment and immediately navigates to `/saved-trips` without persisting anything. Trip name, dates, destination, and collaborators entered during onboarding are all lost on navigation.

**2.6** [FAIL] The trip code generated on Step 2 is only displayed in UI state — it is never stored in the database, which means it cannot actually be used for another user to join the trip.

**2.7** [WARN] Email invitations in Step 2 are purely visual. `EmailInviteSection` adds email addresses to a local list but no invitation is sent. There is no integration with Supabase or an email service.
— `components/InviteShared.tsx`

---

## 3. Trip Management (Spec §Feature 3)

**3.1** [FAIL] `app/saved-trips.tsx` displays 3 hardcoded trips. No Supabase query is made to load the user's actual trips. New trips created via onboarding are not shown here.

**3.2** [FAIL] Search input in `saved-trips.tsx` is rendered but `onChangeText` is not wired to filter the trips list. It is a dead UI element.

**3.3** [PASS] Each trip card shows destination image, name, location, and date range.
— `components/TripCard.tsx`

**3.4** [PASS] "Create new trip" button on the home screen navigates to the onboarding flow.
— `app/choose-trip.tsx`

---

## 4. Itinerary (Spec §Feature 4)

**4.1** [PASS] Manual activity add is implemented with title (required), description (optional), date (required), and time (required) fields, including form validation.
— `app/itinerary.tsx:170–195`

**4.2** [PASS] Activities display as collapsible cards showing title when collapsed and title + description + scheduled time when expanded.
— `components/ItineraryItemCard.tsx`

**4.3** [PASS] The Attach button opens a dropdown with "Upload File" and "Take Photo" options.
— `app/itinerary.tsx:113–148`

**4.4** [FAIL] "Upload File" calls `DocumentPicker` and shows the filename in an `Alert`, but the file is not stored anywhere (no Supabase Storage upload). The spec requires the itinerary items from an attached file to be parsed and added to the list; this is not implemented.
— `app/itinerary.tsx:114–127`

**4.5** [FAIL] "Take Photo" calls `ImagePicker` and shows a confirmation alert, but the photo is not uploaded or associated with any itinerary item.
— `app/itinerary.tsx:129–148`

**4.6** [FAIL] `handleSaveItem` in `app/itinerary.tsx:170` only updates local `useState`. New activities are lost on navigation. No Supabase write.

**4.7** [WARN] `INITIAL_ITEMS` in `app/itinerary.tsx:29` uses `scheduledDate` strings like `'4/15'` (without year) while `formatScheduledDate` produces `M/D` strings. Meanwhile `calendar.tsx` uses full ISO dates (`'2026-04-15'`). These formats are inconsistent and would break any future date-based filtering between the two screens.

---

## 5. Voting (Spec §Feature 5)

**5.1** [PASS] Right swipe = like, left swipe = dislike, up swipe = skip are all implemented as genuine swipe gestures (not buttons).
— `app/vote.tsx:149–176`

**5.2** [PASS] Tutorial pages (Tutorial 1: left/right mechanic, Tutorial 2: up/skip) are implemented and skipped after first view via `AsyncStorage`.
— `app/vote-tutorial-1.tsx`, `app/vote-tutorial-2.tsx`

**5.3** [PASS] Completion screen (`AllActivitiesVotedPage`) is shown when all activities have been voted on and includes the hint pointing to the Itinerary tab.
— `app/all-voted.tsx`

**5.4** [FAIL] Votes are stored in `AsyncStorage` only (local, per device). They are never synced to Supabase, so crew members cannot see each other's votes. The spec requires real-time multi-user vote aggregation.
— `app/vote.tsx:126–129`

**5.5** [FAIL] The activity list on the voting screen is a separate hardcoded `ACTIVITIES` array (`app/vote.tsx:39–80`) that is a copy of `INITIAL_ITEMS` in `itinerary.tsx`. These two lists can diverge. Any activity manually added in the itinerary screen will not appear for voting.

**5.6** [WARN] `setTimeout` of 320 ms is used in `handleVote` (`app/vote.tsx:133`) to advance to the next card. If the user swipes very fast before the timeout fires, `currentIndexRef.current` and `displayIndex` can desync because multiple `setTimeout` callbacks may queue up. Consider using a ref flag to guard against concurrent swipes.

**5.7** [WARN] `app/vote.tsx` mixes React Native `Animated` (for card height) with Reanimated (for swipe transforms). Both are used on the same card. While technically functional, it creates two animation systems to maintain and can cause subtle interaction issues. The spec does not require this split; consider unifying on Reanimated.

**5.8** [WARN] The `VOTING_BG_IMAGE` in `constants/votingConfig.ts` is a single hardcoded Unsplash URL (an F1 race car). The spec says "use some API that pulls the relevant picture from the internet for each activity based on the destination of the trip and the title of the activity." No dynamic image fetching is implemented; every activity card shows the same image.

---

## 6. Calendar (Spec §Feature 6)

**6.1** [PASS] Monthly calendar is implemented using `react-native-calendars` with month navigation, dynamic date display, and a yellow highlight for the selected date, as explicitly required in the spec.
— `app/calendar.tsx`

**6.2** [PASS] Tapping a date navigates to the day view with time-block layout.
— `app/calendar.tsx:60–63`, `app/calendar-day.tsx`

**6.3** [PASS] Activity blocks in the day view have heights that reflect duration (72 px/hour × duration hours).
— `app/calendar-day.tsx:88–91`

**6.4** [FAIL] The spec requires the ability to switch between a **daily and weekly view** and to **drag-and-drop activities** between days in the weekly view. Neither feature is implemented.
— `app/calendar-day.tsx` (no view toggle, no drag-and-drop)

**6.5** [FAIL] The spec requires **swipe left/right between days** in day-only view. This is not implemented; the back button returns to the month calendar instead.
— `app/calendar-day.tsx`

**6.6** [FAIL] `ACTIVITY_DATES` in `app/calendar.tsx:20–24` and `PLACEHOLDER_ACTIVITIES` in `app/calendar-day.tsx:33–52` are both hardcoded. Neither screen queries activities from Supabase. The calendar will show static data regardless of the user's trip.

**6.7** [WARN] The timeline in `calendar-day.tsx` is hardcoded from 10 am to 8 pm (`TIME_SLOTS`, line 15–18). An activity starting before 10 am or ending after 8 pm would render outside the visible timeline container with no overflow handling. The block geometry calculation does not clamp to the container boundaries.

---

## 7. Invite (Spec §Feature 7)

**7.1** [PASS] `InviteMoreCrewPage` reuses the shared invite components from the onboarding flow rather than duplicating code, as required by the spec.
— `app/invite.tsx`, `components/InviteShared.tsx`

**7.2** [PASS] Trip code and email invite input UI is present with copy-to-clipboard and add-by-email functionality.

**7.3** [FAIL] No email is actually sent. The email invite logic only adds addresses to local UI state. There is no Supabase `Invite` table write or email delivery integration.

**7.4** [FAIL] The trip code displayed on the invite screen is regenerated locally on each render rather than loaded from the database for the current trip. A collaborator who receives a code cannot actually join with it because the code is never stored.

**7.5** [PASS] Collaborator avatars with names are displayed in a horizontal scroll row.
— `components/InviteShared.tsx` (`CollaboratorsRow`)

---

## 8. Profile (Spec §Feature 8)

**8.1** [PASS] Settings menu is built as a proper native list with Account Settings (red notification dot), Get Help, View Profile, Privacy, and Log Out — in the exact order the spec requires.
— `app/profile.tsx:124–162`

**8.2** [PASS] Log Out navigates to the sign-in screen.
— `app/profile.tsx:159–161`

**8.3** [FAIL] Log Out does not call `supabase.auth.signOut()`. The session remains active in SecureStore, so the next launch will still have a valid (though un-checked) session. A user who logs out and re-opens the app may re-enter as if still authenticated once auth state checking is added.

**8.4** [FAIL] User stats (name, trips taken, hours saved) are hardcoded constants (`USER_NAME = 'Lily'`, `TRIPS_TAKEN = 3`, `HOURS_SAVED = 85`) rather than fetched from Supabase.
— `app/profile.tsx:18–20`

**8.5** [FAIL] `past-trips.tsx` is a placeholder screen showing "Memory Lane – Past trips coming soon." The spec requires it to show past trips browsable by the user (same as `YourSavedTripsPage`).
— `app/past-trips.tsx`

**8.6** [FAIL] Tapping any settings row (Account Settings, Get Help, View Profile, Privacy) does nothing — `onPress: () => {}` for all four.
— `app/profile.tsx:131`, `137`, `143`, `149`

**8.7** [WARN] The notification dot on Account Settings is hardcoded to always be visible (`notificationDot: true`). The spec implies this should be conditional (e.g. triggered by unread notifications). Always-on creates false urgency.
— `app/profile.tsx:130`

---

## 9. Navigation & Routing (Spec §Screens & Navigation)

**9.1** [PASS] `BottomNavigationBar` is a reusable component with a dynamic `activeTab` prop that applies yellow label and underline indicator to the active tab.
— `components/BottomNavigationBar.tsx`

**9.2** [FAIL] The Voting tab in `BottomNavigationBar` always navigates to `/vote-tutorial-1` (`components/BottomNavigationBar.tsx:39`). After a user has seen the tutorial, pressing the Voting tab should go directly to `/vote`. The tutorial skip check only runs as a `useEffect` on Tutorial 1's own mount — this creates a visible flash of Tutorial 1 before redirecting.

**9.3** [FAIL] There are no authentication guards anywhere in the app. Unauthenticated users can navigate directly to any screen by deep link or by reaching it programmatically. The spec defines "Guest" users as having no access to trip features.

**9.4** [WARN] All tab bar navigations use `router.replace()` instead of `router.navigate()` or tab-based navigation. This clears navigation history on every tab switch, meaning the Android back button cannot return to a previous tab's state.
— `components/BottomNavigationBar.tsx:73`

**9.5** [WARN] `app/(tabs)/` directory exists in the project (from the Expo default template) but is unused. The app uses `router.replace()` in `BottomNavigationBar` instead of Expo Router's native tab layout. This means the tab bar is not a true native tab navigator and loses tab state on each switch (no tab stack preservation). Consider migrating to Expo Router's `(tabs)` layout for correct native behavior.

**9.6** [PASS] All screens use `SafeAreaView` with `edges` prop for safe area handling, and use `Dimensions.get('window')` percentages instead of fixed pixel values, consistent with the spec's responsiveness requirement.

---

## 10. Data Layer & Backend (Spec §API & Backend)

**10.1** [FAIL] Supabase is initialized (`lib/supabase.ts`) but zero data queries exist in the codebase. Every screen uses hardcoded placeholder data. The entire data model (Trip, TripMember, ItineraryItem, Vote, Destination, Invite) is defined in the spec but not implemented in any database schema or query.

**10.2** [FAIL] No Supabase Realtime subscriptions are set up. The spec calls for live sync of votes, itinerary changes, and new member joins across all devices.

**10.3** [FAIL] Google Places API is listed as a dependency in the spec for destination search and trending destinations. The `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` env var is referenced in `.env.example` but is never read or used in any screen.

**10.4** [FAIL] Unsplash API (for destination cover images and voting card backgrounds) is not integrated. Images use hardcoded Unsplash `photo-id` URLs. The spec requires the voting screen to "pull the relevant picture from the internet for each activity based on the destination of the trip and the title of the activity."

**10.5** [WARN] Hardcoded Unsplash `?w=600` photo URLs will return images reliably today but Unsplash's free-tier hotlinking policy could revoke these at any time. Production use requires the Unsplash API with an access key to comply with their terms of service.

---

## 11. Offline Behavior (Spec §Offline Behavior)

**11.1** [FAIL] No "You're offline" banner is shown when connectivity is lost. The spec requires a visible indicator at the top of the screen.

**11.2** [FAIL] `expo-netinfo` is not listed in `package.json` and is not used anywhere. No network state detection is implemented.

**11.3** [FAIL] No `AsyncStorage` or React Query caching of Supabase data is implemented. Because there are no real Supabase queries, there is nothing to cache — but the offline-read behavior described in the spec (view saved trips, itinerary, calendar while offline) is effectively non-functional.

**11.4** [FAIL] Interactive elements requiring network are not visually greyed out when offline, as the spec requires.

---

## 12. Push Notifications & Background Tasks (Spec §Notifications)

**12.1** [FAIL] `expo-notifications` is not present in `package.json` and is not configured anywhere. No push notification categories (new collaborator joined, new itinerary item, voting reminder, trip starting soon) are implemented.

**12.2** [FAIL] `expo-task-manager` and `expo-background-fetch` are not present in `package.json`. No background tasks for trip code expiry, vote tallying, or calendar sync are implemented.

**12.3** [FAIL] No Supabase Realtime listeners for background sync of votes, itinerary changes, or new member joins.

---

## 13. Analytics & Monitoring (Spec §Analytics)

**13.1** [FAIL] PostHog is not installed or configured. No user event tracking is implemented for any of the specified events (`user_signed_up`, `trip_created`, `vote_cast`, etc.).

**13.2** [FAIL] Sentry is not installed or configured. No crash reporting is wired up.

---

## 14. Design & Branding (Spec §Design & Branding)

**14.1** [PASS] Color palette matches the spec exactly: `primaryBlue #76b9ff`, `darkNavy #1d5abc`, `yellow #febd19`, `lightYellow #fef3b3`, `white`, `black`, `lightGray #828282`, `red #E53935`, `green #43A047`.
— `constants/theme.ts`

**14.2** [WARN] The spec specifies `##1d5abc` for Dark Navy Blue (note the double `#` which is a typo in the spec). The codebase correctly uses `#1d5abc`.
— `constants/theme.ts`

**14.3** [PASS] Acme font is used for the "On the GO!" logo; Merriweather is used for body text throughout.
— `constants/theme.ts`

**14.4** [PASS] All content is grouped in white rounded cards with shadows, consistent with the "card-based UI" style direction.

**14.5** [PASS] Rounded corners (`Radius.sm/md/lg/xl/full`) are used consistently throughout. No hardcoded `borderRadius` magic numbers.

---

## 15. Code Quality

**15.1** [WARN] The `ACTIVITIES` array in `app/vote.tsx:39–80` and `INITIAL_ITEMS` in `app/itinerary.tsx:29–65` are separate hardcoded copies of the same 5 activities with slightly different field shapes. Any future data change must be made in two places. Both should read from a single source (Supabase) or at minimum a shared constant.

**15.2** [WARN] `app/calendar-day.tsx:188` renders `<BottomNavigationBar />` without passing `activeTab`. No tab is shown as active on the calendar day view, which is a sub-screen of the Calendar tab. The Calendar tab should remain highlighted. Pass `activeTab="calendar"`.

**15.3** [WARN] `app/all-voted.tsx` renders no `BottomNavigationBar` at all. The spec explicitly requires the bottom nav to be accessible from `AllActivitiesVotedPage`.
— `app/all-voted.tsx` (no BottomNavigationBar import or usage)

**15.4** [WARN] `app/vote-tutorial-1.tsx:52` and `app/vote-tutorial-2.tsx` both have `useEffect(..., [])` with a missing `router` dependency. ESLint would flag this. The effect is safe here because `router` is stable, but it is inconsistent with the codebase's general practice of listing deps.

**15.5** [WARN] `app/vote.tsx:146` and `:175` both have `// eslint-disable-line react-hooks/exhaustive-deps` comments suppressing legitimate warnings. `handleVote` closes over `collapseCard`, `cardAnim`, `translateX`, and `translateY` which should be in the dependency array or moved to refs.

**15.6** [PASS] `InviteShared.tsx` correctly extracts shared invite logic into reusable components and hooks (`TripCodeCard`, `EmailInviteSection`, `CollaboratorsRow`, `useCopyCode`), avoiding code duplication between `invite.tsx` and `invite-collaborators.tsx`.

**15.7** [WARN] `app/itinerary.tsx:408` uses `Colors.signInBlue` as the background color for the Itinerary screen. `signInBlue` is not defined in the spec's color palette — it appears to be the same as `primaryBlue` but stored under a different key. Either consolidate to one key or add `signInBlue` to the documented palette.
— `constants/theme.ts`

**15.8** [WARN] `app/calendar-day.tsx:11` uses a fixed `SLOT_H = 72` pixels for the timeline. On very small screens (iPhone SE, 320 px wide) or very large ones (iPhone 17 Pro Max), this value does not scale. Using `height * 0.09` (relative) would be consistent with the rest of the codebase and the spec's responsiveness requirement.

**15.9** [WARN] Logo markup (`<Text>On the </Text><Text style={accent}>GO!</Text>`) is copy-pasted into every screen's header rather than extracted to a `<AppLogo />` component. This appears in at least 8 screens. A single change to font size or layout currently requires editing every screen individually.

**15.10** [WARN] `app/profile.tsx:152–161`: The `SETTINGS_ITEMS` array is defined inside the component body, causing it to be recreated on every render. It depends on `router` (from `useRouter`) but is not wrapped in `useMemo`. Move it outside the component or memoize it.

**15.11** [PASS] TypeScript strict mode is enabled and the codebase consistently types props, return values, and state. No `any` casts were observed in screen code (only `as any` in BottomNavigationBar's `router.replace` for route typing, line 73).

**15.12** [PASS] All screen containers use `Dimensions.get('window')` for width/height and derive sizes as percentages, satisfying the spec's responsiveness requirement. No hardcoded pixel sizes appear in layout-critical styles.

---

## Summary Table

| Category | Pass | Fail | Warn |
|---|---|---|---|
| Authentication | 3 | 4 | 2 |
| Trip Creation | 2 | 4 | 1 |
| Trip Management | 2 | 2 | 0 |
| Itinerary | 3 | 3 | 1 |
| Voting | 3 | 3 | 3 |
| Calendar | 3 | 3 | 2 |
| Invite | 2 | 3 | 0 |
| Profile | 2 | 4 | 1 |
| Navigation | 2 | 3 | 3 |
| Data / Backend | 0 | 4 | 1 |
| Offline Behavior | 0 | 4 | 0 |
| Notifications / Background | 0 | 3 | 0 |
| Analytics / Monitoring | 0 | 2 | 0 |
| Design & Branding | 4 | 0 | 1 |
| Code Quality | 3 | 0 | 9 |
| **Total** | **29** | **46** | **24** |

---

## Critical Issues (must fix before app is usable)

1. **No Supabase data integration** — all screens show hardcoded data; nothing created or voted on persists.
2. **No session persistence** — returning users are always sent to sign-in; there is no `onAuthStateChange` listener.
3. **Log Out does not call `supabase.auth.signOut()`** — the session is not cleared.
4. **Trip code is never stored** — collaborators cannot join because the code is not saved to the database.
5. **Voting is local-only** — crew members cannot see each other's votes; the entire multi-user voting feature is non-functional.
6. **No auth guards** — any screen is accessible without being signed in.
7. **Itinerary activities and voting activities are separate hardcoded lists** — adding an activity in the itinerary screen does not add it to the voting queue.
