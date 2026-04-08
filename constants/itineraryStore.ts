/**
 * Single source of truth for itinerary items.
 * Both ItineraryPage and VoteOnActivityPage read from and write to this store.
 * AsyncStorage is the local persistence layer — Supabase will replace it later.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItineraryItem } from '@/components/ItineraryItemCard';

export const ITINERARY_KEY = 'itinerary_items';

// ── Default image used for activities without a dedicated photo ──
// Supabase / Unsplash API will supply per-activity images once wired up.
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&auto=format&fit=crop';

// Image map keyed by activity id — for the 5 hardcoded seed items.
// New items added by the user fall back to FALLBACK_IMAGE.
const SEED_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop',
  '2': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop',
  '3': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=900&auto=format&fit=crop',
  '4': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&auto=format&fit=crop',
  '5': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&auto=format&fit=crop',
};

// ── Seed items — single definition used by both screens ──────
export const INITIAL_ITEMS: ItineraryItem[] = [
  {
    id: '1',
    title: 'F1 Arcade',
    description:
      'Racing simulator experience. Multiple simulators available — book a bay ahead for weekends.',
    scheduledDate: '4/15',
    scheduledTime: '1:00 pm',
  },
  {
    id: '2',
    title: 'Dinner at Strega',
    description:
      'Upscale Italian restaurant in the North End. Known for the pasta and ambiance. Make a reservation.',
    scheduledDate: '4/15',
    scheduledTime: '7:30 pm',
  },
  {
    id: '3',
    title: 'Duck Tour',
    description:
      'Boston Duck Tour — land and water sightseeing experience through the city.',
    scheduledDate: '4/16',
    scheduledTime: '10:00 am',
  },
  {
    id: '4',
    title: 'Fenway Park Visit',
    description:
      'Guided tour of the historic ballpark. Check the Red Sox schedule for a game option.',
    scheduledDate: '4/16',
    scheduledTime: '2:00 pm',
  },
  {
    id: '5',
    title: 'Rooftop Bar Night',
    description:
      'Drinks and panoramic city views at Lookout Rooftop & Bar. 21+ only.',
    scheduledDate: '4/17',
    scheduledTime: '8:00 pm',
  },
];

// ── Activity shape consumed by vote.tsx ──────────────────────
export interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

/** Maps an ItineraryItem to the Activity shape needed by the vote screen. */
export function itemToActivity(item: ItineraryItem): Activity {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: SEED_IMAGES[item.id] ?? FALLBACK_IMAGE,
  };
}

// ── AsyncStorage helpers ──────────────────────────────────────

/** Load items from AsyncStorage. Falls back to INITIAL_ITEMS on first run. */
export async function loadItems(): Promise<ItineraryItem[]> {
  try {
    const stored = await AsyncStorage.getItem(ITINERARY_KEY);
    if (stored) return JSON.parse(stored) as ItineraryItem[];
  } catch (e) {
    console.warn('[itineraryStore] loadItems error:', e);
  }
  return INITIAL_ITEMS;
}

/** Persist the full items list to AsyncStorage. */
export async function saveItems(items: ItineraryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ITINERARY_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('[itineraryStore] saveItems error:', e);
  }
}
