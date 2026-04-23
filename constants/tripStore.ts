/**
 * Shared local store for trips.
 * Written by the onboarding flow (choose-destination.tsx) and read by saved-trips.tsx.
 * AsyncStorage is the persistence layer — Supabase will replace this later.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripCardData } from '@/components/TripCard';
import { supabase } from '@/lib/supabase';
import { fetchUnsplashImage } from '@/constants/unsplash';

export const TRIPS_KEY = 'saved_trips';

// Draft key — trip-name.tsx writes here, choose-destination.tsx reads + completes
export const TRIP_DRAFT_KEY = 'trip_draft';

export interface TripDraft {
  name: string;
  startDate: string | null;  // ISO string
  endDate: string | null;    // ISO string
  tripCode?: string;         // generated in invite-collaborators step
}


function formatDateRange(isoStart: string | null, isoEnd: string | null): { startDate: string; endDate: string } {
  const fmt = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return { startDate: fmt(isoStart), endDate: fmt(isoEnd) };
}

// ── Draft helpers (trip-name.tsx → invite-collaborators.tsx → choose-destination.tsx) ──

export async function saveDraft(draft: TripDraft): Promise<void> {
  await AsyncStorage.setItem(TRIP_DRAFT_KEY, JSON.stringify(draft));
}

export async function loadDraft(): Promise<TripDraft | null> {
  const stored = await AsyncStorage.getItem(TRIP_DRAFT_KEY);
  return stored ? (JSON.parse(stored) as TripDraft) : null;
}

export async function clearDraft(): Promise<void> {
  await AsyncStorage.removeItem(TRIP_DRAFT_KEY);
}

// ── Trip list helpers (saved-trips.tsx) ───────────────────────

export async function loadTrips(): Promise<TripCardData[]> {
  try {
    const stored = await AsyncStorage.getItem(TRIPS_KEY);
    if (stored) return JSON.parse(stored) as TripCardData[];
  } catch (e) {
    console.warn('[tripStore] loadTrips error:', e);
  }
  return [];
}

export async function saveTrips(trips: TripCardData[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  } catch (e) {
    console.warn('[tripStore] saveTrips error:', e);
  }
}

/** Called at the end of onboarding to commit the draft as a real trip. */
export async function commitDraftAsTrip(destinationName: string): Promise<void> {
  const draft = await loadDraft();
  const { startDate, endDate } = formatDateRange(
    draft?.startDate ?? null,
    draft?.endDate ?? null,
  );

  const coverImageUrl = await fetchUnsplashImage(destinationName);

  const newTrip: TripCardData = {
    id: String(Date.now()),
    name: draft?.name ?? 'My Trip',
    location: destinationName,
    startDate,
    endDate,
    coverImageUrl,
  };

  const existing = await loadTrips();
  await saveTrips([newTrip, ...existing]);

  // Persist to Supabase when configured and a trip code exists in the draft
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';
  if (isConfigured && draft?.tripCode) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;
    if (userId) {
      await supabase.from('trips').insert({
        name:       draft.name ?? 'My Trip',
        trip_code:  draft.tripCode,
        creator_id: userId,
        start_date: draft.startDate ? draft.startDate.split('T')[0] : null,
        end_date:   draft.endDate   ? draft.endDate.split('T')[0]   : null,
      });
    }
  }

  await clearDraft();
}
