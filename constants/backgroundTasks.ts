/**
 * Background tasks registered with expo-task-manager / expo-background-fetch.
 *
 * IMPORTANT: TaskManager.defineTask MUST be called at module top-level (not
 * inside functions or components). This file must be imported in _layout.tsx
 * before any navigation renders so the tasks are registered on every JS
 * runtime launch — including background launches triggered by the OS.
 */
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Task name constants ───────────────────────────────────────
export const TASK_TRIP_CODE_EXPIRY = 'TRIP_CODE_EXPIRY';
export const TASK_VOTE_TALLY       = 'VOTE_TALLY';
export const TASK_CALENDAR_SYNC    = 'CALENDAR_SYNC';

// Re-used storage keys (mirrors tripStore / itineraryStore / vote keys)
const TRIPS_KEY     = 'saved_trips';
const ITINERARY_KEY = 'itinerary_items';
const VOTES_KEY     = 'votes';
export const VOTE_TALLY_KEY        = 'vote_tally';       // written by tally task
export const EXPIRED_CODES_KEY     = 'expired_trip_codes';
export const SYNCED_ITINERARY_KEY  = 'bg_synced_itinerary';

// Trip codes older than this are considered expired
const CODE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Task: trip code expiry ────────────────────────────────────
// Reads saved trips, flags those whose codes are older than CODE_TTL_MS,
// and writes the expired code set to AsyncStorage so the UI can show a badge.
TaskManager.defineTask(TASK_TRIP_CODE_EXPIRY, async () => {
  try {
    const raw = await AsyncStorage.getItem(TRIPS_KEY);
    if (!raw) return BackgroundFetch.BackgroundFetchResult.NoData;

    const trips: Array<{ id: string; createdAt?: number }> = JSON.parse(raw);
    const now = Date.now();
    const expired: string[] = [];

    for (const trip of trips) {
      if (trip.createdAt && now - trip.createdAt > CODE_TTL_MS) {
        expired.push(trip.id);
      }
    }

    await AsyncStorage.setItem(EXPIRED_CODES_KEY, JSON.stringify(expired));
    return expired.length > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// ── Task: vote tallying ───────────────────────────────────────
// Reads the votes map and itinerary items, computes per-activity like/dislike
// counts, and persists the tally so the results screen can read it instantly.
TaskManager.defineTask(TASK_VOTE_TALLY, async () => {
  try {
    const [rawVotes, rawItems] = await Promise.all([
      AsyncStorage.getItem(VOTES_KEY),
      AsyncStorage.getItem(ITINERARY_KEY),
    ]);
    if (!rawVotes || !rawItems) return BackgroundFetch.BackgroundFetchResult.NoData;

    const votes: Record<string, 'like' | 'dislike' | 'skip'> = JSON.parse(rawVotes);
    const items: Array<{ id: string; title: string }> = JSON.parse(rawItems);

    const tally: Record<string, { title: string; likes: number; dislikes: number; skips: number }> = {};
    for (const item of items) {
      tally[item.id] = { title: item.title, likes: 0, dislikes: 0, skips: 0 };
    }
    for (const [activityId, value] of Object.entries(votes)) {
      if (!tally[activityId]) continue;
      if (value === 'like')    tally[activityId].likes++;
      else if (value === 'dislike') tally[activityId].dislikes++;
      else if (value === 'skip')    tally[activityId].skips++;
    }

    await AsyncStorage.setItem(VOTE_TALLY_KEY, JSON.stringify(tally));
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// ── Task: calendar sync ───────────────────────────────────────
// Takes a snapshot of the current itinerary items and writes it to a
// separate AsyncStorage key that the calendar screen can read offline.
// When Supabase is wired up, this is where you'd pull the latest items.
TaskManager.defineTask(TASK_CALENDAR_SYNC, async () => {
  try {
    const raw = await AsyncStorage.getItem(ITINERARY_KEY);
    if (!raw) return BackgroundFetch.BackgroundFetchResult.NoData;

    // Stamp the sync time so the calendar screen knows how fresh the data is
    const payload = { syncedAt: Date.now(), items: JSON.parse(raw) };
    await AsyncStorage.setItem(SYNCED_ITINERARY_KEY, JSON.stringify(payload));
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// ── Registration helper ───────────────────────────────────────

/**
 * Registers all three background tasks with the OS scheduler.
 * Safe to call multiple times — re-registration is a no-op if already active.
 * Call once from _layout.tsx on app launch.
 */
export async function registerBackgroundTasks(): Promise<void> {
  const options: BackgroundFetch.BackgroundFetchOptions = {
    minimumInterval: 15 * 60,  // 15 min (iOS minimum; Android can be lower)
    stopOnTerminate: false,     // continue after app is closed
    startOnBoot: true,          // restart after device reboot
  };

  const tasks = [TASK_TRIP_CODE_EXPIRY, TASK_VOTE_TALLY, TASK_CALENDAR_SYNC];

  await Promise.all(
    tasks.map(async taskName => {
      const status = await BackgroundFetch.getStatusAsync();
      if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
          status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        console.warn(`[BackgroundFetch] Permission denied — ${taskName} will not run`);
        return;
      }
      const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(taskName, options);
      }
    }),
  );
}
