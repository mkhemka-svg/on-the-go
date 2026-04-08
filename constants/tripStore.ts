/**
 * Shared local store for trips.
 * Written by the onboarding flow (choose-destination.tsx) and read by saved-trips.tsx.
 * AsyncStorage is the persistence layer — Supabase will replace this later.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripCardData } from '@/components/TripCard';

export const TRIPS_KEY = 'saved_trips';

// Draft key — trip-name.tsx writes here, choose-destination.tsx reads + completes
export const TRIP_DRAFT_KEY = 'trip_draft';

export interface TripDraft {
  name: string;
  startDate: string | null;  // ISO string
  endDate: string | null;    // ISO string
}

// ── Fallback image for custom destinations ─────────────────────
const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop';

// Image map for known trending destinations (by destination name)
const DESTINATION_IMAGES: Record<string, string> = {
  Paris:       'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
  Tokyo:       'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop',
  'New York':  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop',
  Bali:        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop',
  London:      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  Barcelona:   'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop',
  Cancún:      'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&auto=format&fit=crop',
  Dubai:       'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop',
  Sydney:      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop',
  Rome:        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop',
};

function coverForDestination(destinationName: string): string {
  return DESTINATION_IMAGES[destinationName] ?? FALLBACK_COVER;
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

  const newTrip: TripCardData = {
    id: String(Date.now()),
    name: draft?.name ?? 'My Trip',
    location: destinationName,
    startDate,
    endDate,
    coverImageUrl: coverForDestination(destinationName),
  };

  const existing = await loadTrips();
  await saveTrips([newTrip, ...existing]);
  await clearDraft();
}
