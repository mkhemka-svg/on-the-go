# Project Review vs SPEC-2.md (Most Recent)

1. [PASS] Authentication flow exists and matches the spec.
   - `app/sign-in.tsx` lines 43-245 implements email OTP, Google OAuth, and Apple sign in.
   - `app/verify-otp.tsx` lines 36-55 verifies the 6-digit code and navigates to `/choose-trip`.

2. [PASS] 3-step trip creation flow is implemented.
   - `app/(onboarding)/trip-name.tsx` implements trip name + date selection.
   - `app/(onboarding)/invite-collaborators.tsx` implements trip code generation, email invite input, and dynamic collaborator avatars.
   - `app/(onboarding)/choose-destination.tsx` implements trending destination cards and custom destination entry.

3. [WARN] Invite flow is UI-only and lacks backend invite persistence.
   - `app/(onboarding)/invite-collaborators.tsx` and `app/invite.tsx` use `CollaboratorsRow` and `TripCodeCard`.
   - Added emails are stored only locally; no invite request or trip membership update is sent to Supabase.

4. [PASS] Saved trips view shows destination photo, name, location, and date range.
   - `app/saved-trips.tsx` and `components/TripCard.tsx` render the saved trips list with trip metadata.

5. [FAIL] Trip selection is not trip-specific.
   - `app/saved-trips.tsx` lines 58-66 navigates to `/itinerary` for every trip without passing or selecting a trip ID.
   - `app/itinerary.tsx`, `app/calendar.tsx`, `app/calendar-day.tsx`, and `app/vote.tsx` operate on a global itinerary store rather than a selected trip.

6. [FAIL] Itinerary attach flow does not implement item extraction from uploaded attachments.
   - `app/itinerary.tsx` lines 92-107 and 206-211 open document/camera pickers but only show an alert or store the image URI.
   - The spec requirement to interpret itinerary items from attachments is not satisfied.

7. [PASS] Itinerary item expand/collapse behavior is implemented.
   - `components/ItineraryItemCard.tsx` lines 27-78 support collapsed/expanded states and show description, schedule, and photo.

8. [PASS] Monthly calendar screen uses `react-native-calendars`.
   - `app/calendar.tsx` lines 97-110 use `Calendar` with `markingType="multi-dot"`, day selection, and navigation to `/calendar-day`.

9. [PASS] Calendar day/week view is implemented.
   - `app/calendar-day.tsx` lines 330-680 support day swipe navigation and week view drag-and-drop.

10. [PASS] Voting gestures are implemented with swipe left/right/up.
    - `app/vote.tsx` lines 151-168 implement `Gesture.Pan()` and call `handleVote` via `runOnJS`.

11. [PASS] Voting tutorial sequence is implemented and only shown once.
    - `components/BottomNavigationBar.tsx` lines 38-50 choose `/vote-tutorial-1` or `/vote` based on `TUTORIAL_KEY` in AsyncStorage.
    - `app/vote-tutorial-2.tsx` line 31 writes the tutorial flag and transitions to `/vote`.

12. [PASS] Vote info card expansion is implemented as an expanded state.
    - `app/vote.tsx` lines 121-150 toggle the card to reveal the full description.

13. [WARN] Activity images are fetched only by activity title, not by destination plus title.
    - `constants/itineraryStore.ts` line 42 maps seeded items to images by id.
    - `app/vote.tsx` line 44 calls `fetchUnsplashImage(a.title)` without using the trip destination.

14. [FAIL] Bottom navigation active state is inconsistently configured.
    - `app/profile.tsx` line 524, `app/calendar-day.tsx` line 188, `app/past-trips.tsx` line 109, and `app/saved-trips.tsx` line 122 render `BottomNavigationBar` without `activeTab`.
    - This causes the tab indicator and active text styling to be missing on many screens.

15. [FAIL] Voting screens omit the BottomNavigationBar.
    - `app/vote.tsx` does not render `BottomNavigationBar`.
    - `app/vote-tutorial-1.tsx` and `app/vote-tutorial-2.tsx` also omit the nav bar, contrary to the spec requirement that the bottom nav remain accessible.

16. [FAIL] AllActivitiesVotedPage does not render the BottomNavigationBar.
    - `app/all-voted.tsx` has no nav bar, conflicting with the spec expectation that the user can still access the main tabs.

17. [WARN] Profile settings menu is incomplete and differs from spec.
    - `app/profile.tsx` lines 240-280 implement only Account Settings, Get Help, Privacy, and Log Out.
    - The spec requires a “View Profile” row and an Account Settings notification dot.

18. [WARN] Offline UX is missing.
    - The app has no network connectivity detection, no offline banner, and no disabled visual state for network-dependent actions.
    - AsyncStorage caching exists, but the spec-specific offline UI behavior is not implemented.

19. [WARN] Background sync and notifications are only partially implemented.
    - `constants/backgroundTasks.ts` defines tasks and registration, but the logic is essentially stubbed and does not perform real remote data sync.
    - `constants/notifications.ts` supports local scheduled notifications, but there is no remote collaborator or vote reminder infrastructure in this codebase.

20. [WARN] Saved Trips screen has a confusing UI label.
    - `app/saved-trips.tsx` line 48 shows a search input with placeholder `Add a new trip`, which is misleading because the field acts as a filter.

21. [WARN] Trip card navigation ignores trip context.
    - `components/TripCard.tsx` passes the trip id into `onPress`, but `app/saved-trips.tsx` line 60 uses a static `/itinerary` route and does not pass this id.

22. [WARN] `ChooseDestinationPage` degrading behavior is not surfaced to the user when the Google Places API key is absent.
    - `app/(onboarding)/choose-destination.tsx` logs a warning but still only allows custom input; no user feedback explains why autocomplete is unavailable.

## Summary

The existing codebase delivers a strong visual and interaction baseline for the app: sign-in/auth flows work, onboarding screens are present, the trip creation stepper is implemented, the voting tutorial exists, and calendar/day-view interactions are available. However, the product is not yet fully aligned with SPEC-2 because the core data model is still local and unscoped to a selected trip.

High-priority fixes:
- Wire trip selection through saved trips so itinerary, calendar, and voting load a chosen trip instead of a global store.
- Add BottomNavigationBar to voting and completion screens, and ensure active tab styling is correct everywhere.
- Implement real invite persistence and trip membership updates, not just local UI state.
- Surface network/offline state and disable network-dependent actions when offline.

Medium-priority improvements:
- Implement attachment parsing or clearly mark the feature as not supported yet.
- Use destination context when fetching Unsplash images for voting backgrounds.
- Add missing profile menu rows and the Account Settings notification dot.
- Improve onboarding fallback feedback when Google Places autocomplete is unavailable.

Overall, the app is functional in many areas, but it needs stronger trip-scoped state management and backend integration to meet the spec end-to-end.