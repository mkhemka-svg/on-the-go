/**
 * Supabase Realtime subscriptions.
 *
 * Three channels are opened once the user has a session:
 *   • votes          — syncs remote vote changes into AsyncStorage
 *   • itinerary_items — syncs remote itinerary changes into AsyncStorage
 *   • trip_members   — fires a local notification when a new member joins
 *
 * Call startRealtimeSync() from _layout.tsx. It subscribes to
 * supabase.auth.onAuthStateChange so channels open on sign-in and
 * are torn down on sign-out. Returns a cleanup function.
 */
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { notifyCollaboratorJoined } from '@/constants/notifications';

const VOTES_KEY     = 'votes';
const ITINERARY_KEY = 'itinerary_items';

type VoteValue = 'like' | 'dislike' | 'skip';

// ── Votes channel ─────────────────────────────────────────────

function subscribeVotes(): RealtimeChannel {
  return supabase
    .channel('realtime-votes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'votes' },
      async payload => {
        // Merge the incoming vote into the local AsyncStorage cache so the
        // vote screen and background tally task both see the latest state.
        try {
          const raw = await AsyncStorage.getItem(VOTES_KEY);
          const local: Record<string, VoteValue> = raw ? JSON.parse(raw) : {};

          if (payload.eventType === 'DELETE') {
            const id = (payload.old as { itinerary_item_id?: string }).itinerary_item_id;
            if (id) delete local[id];
          } else {
            const row = payload.new as { itinerary_item_id?: string; value?: VoteValue };
            if (row.itinerary_item_id && row.value) {
              local[row.itinerary_item_id] = row.value;
            }
          }

          await AsyncStorage.setItem(VOTES_KEY, JSON.stringify(local));
        } catch (e) {
          console.warn('[Realtime] votes merge failed:', e);
        }
      },
    )
    .subscribe();
}

// ── Itinerary items channel ───────────────────────────────────

function subscribeItinerary(): RealtimeChannel {
  return supabase
    .channel('realtime-itinerary')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'itinerary_items' },
      async payload => {
        try {
          const raw = await AsyncStorage.getItem(ITINERARY_KEY);
          const local: Array<{ id: string; [key: string]: unknown }> = raw
            ? JSON.parse(raw)
            : [];

          if (payload.eventType === 'INSERT') {
            const incoming = payload.new as { id: string };
            if (!local.find(i => i.id === incoming.id)) {
              local.unshift(incoming);
            }
          } else if (payload.eventType === 'UPDATE') {
            const incoming = payload.new as { id: string };
            const idx = local.findIndex(i => i.id === incoming.id);
            if (idx !== -1) local[idx] = { ...local[idx], ...incoming };
            else local.unshift(incoming);
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as { id?: string }).id;
            const idx = local.findIndex(i => i.id === id);
            if (idx !== -1) local.splice(idx, 1);
          }

          await AsyncStorage.setItem(ITINERARY_KEY, JSON.stringify(local));
        } catch (e) {
          console.warn('[Realtime] itinerary merge failed:', e);
        }
      },
    )
    .subscribe();
}

// ── Trip members channel ──────────────────────────────────────

function subscribeMembers(currentUserId: string): RealtimeChannel {
  return supabase
    .channel('realtime-members')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'trip_members' },
      async payload => {
        // Only notify when someone *else* joins — not when the current user joins.
        const row = payload.new as { user_id?: string; email?: string };
        if (row.user_id === currentUserId) return;
        const label = row.email ?? 'A new crew member';
        void notifyCollaboratorJoined(label);
      },
    )
    .subscribe();
}

// ── Public API ────────────────────────────────────────────────

/**
 * Sets up auth-state-aware Realtime subscriptions.
 * Returns a teardown function to call on unmount.
 */
export function startRealtimeSync(): () => void {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return () => {};
  }

  let channels: RealtimeChannel[] = [];

  const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // Tear down existing channels first
      await Promise.all(channels.map(c => supabase.removeChannel(c)));
      channels = [];

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const userId = session?.user.id ?? '';
        channels = [
          subscribeVotes(),
          subscribeItinerary(),
          subscribeMembers(userId),
        ];
      }
    },
  );

  // Also open channels immediately if a session already exists
  void supabase.auth.getSession().then(({ data }) => {
    if (data.session && channels.length === 0) {
      const userId = data.session.user.id;
      channels = [
        subscribeVotes(),
        subscribeItinerary(),
        subscribeMembers(userId),
      ];
    }
  });

  return () => {
    authSub.unsubscribe();
    void Promise.all(channels.map(c => supabase.removeChannel(c)));
  };
}
