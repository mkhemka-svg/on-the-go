-- ============================================================
-- On the GO! — Row Level Security Policies
-- Run AFTER 002_triggers.sql
-- ============================================================

-- Enable RLS on every table
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips           ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites         ENABLE ROW LEVEL SECURITY;

-- ── Helper: is the current user a member of a given trip? ─────

CREATE OR REPLACE FUNCTION is_trip_member(trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_members.trip_id = $1
      AND trip_members.user_id = auth.uid()
  );
$$;

-- ── Helper: is the current user the creator of a given trip? ──

CREATE OR REPLACE FUNCTION is_trip_creator(trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_members.trip_id = $1
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'creator'
  );
$$;

-- ════════════════════════════════════════════════════════════
-- profiles
-- ════════════════════════════════════════════════════════════

-- Users can read any profile (needed to show collaborator avatars)
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- destinations
-- ════════════════════════════════════════════════════════════

-- Anyone authenticated can read destinations (for trending grid)
CREATE POLICY "destinations_select"
  ON destinations FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update destinations (seeded server-side)
-- No INSERT/UPDATE/DELETE policy for authenticated users

-- ════════════════════════════════════════════════════════════
-- trips
-- ════════════════════════════════════════════════════════════

-- Members can read their trips
CREATE POLICY "trips_select"
  ON trips FOR SELECT
  TO authenticated
  USING (is_trip_member(id));

-- Any authenticated user can create a trip
CREATE POLICY "trips_insert"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Only the creator can update the trip
CREATE POLICY "trips_update"
  ON trips FOR UPDATE
  TO authenticated
  USING (is_trip_creator(id));

-- Only the creator can delete the trip
CREATE POLICY "trips_delete"
  ON trips FOR DELETE
  TO authenticated
  USING (is_trip_creator(id));

-- ════════════════════════════════════════════════════════════
-- trip_members
-- ════════════════════════════════════════════════════════════

-- Members can see who else is in the trip
CREATE POLICY "trip_members_select"
  ON trip_members FOR SELECT
  TO authenticated
  USING (is_trip_member(trip_id));

-- Users can join a trip (insert themselves as collaborator)
CREATE POLICY "trip_members_insert"
  ON trip_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only creator can remove members; members can remove themselves
CREATE POLICY "trip_members_delete"
  ON trip_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_trip_creator(trip_id));

-- ════════════════════════════════════════════════════════════
-- itinerary_items
-- ════════════════════════════════════════════════════════════

-- Trip members can read all itinerary items for their trips
CREATE POLICY "itinerary_items_select"
  ON itinerary_items FOR SELECT
  TO authenticated
  USING (is_trip_member(trip_id));

-- Trip members can add items
CREATE POLICY "itinerary_items_insert"
  ON itinerary_items FOR INSERT
  TO authenticated
  WITH CHECK (is_trip_member(trip_id) AND created_by = auth.uid());

-- Item creator or trip creator can update
CREATE POLICY "itinerary_items_update"
  ON itinerary_items FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR is_trip_creator(trip_id));

-- Item creator or trip creator can delete
CREATE POLICY "itinerary_items_delete"
  ON itinerary_items FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR is_trip_creator(trip_id));

-- ════════════════════════════════════════════════════════════
-- votes
-- ════════════════════════════════════════════════════════════

-- Trip members can see all votes on their trip's items
CREATE POLICY "votes_select"
  ON votes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itinerary_items i
      WHERE i.id = itinerary_item_id
        AND is_trip_member(i.trip_id)
    )
  );

-- Trip members can cast their own vote
CREATE POLICY "votes_insert"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM itinerary_items i
      WHERE i.id = itinerary_item_id
        AND is_trip_member(i.trip_id)
    )
  );

-- Users can change their own vote
CREATE POLICY "votes_update"
  ON votes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- invites
-- ════════════════════════════════════════════════════════════

-- Trip members can see invites for their trip
CREATE POLICY "invites_select"
  ON invites FOR SELECT
  TO authenticated
  USING (is_trip_member(trip_id));

-- Trip members can send invites
CREATE POLICY "invites_insert"
  ON invites FOR INSERT
  TO authenticated
  WITH CHECK (is_trip_member(trip_id) AND invited_by = auth.uid());

-- Invite sender or trip creator can update (accept/decline)
CREATE POLICY "invites_update"
  ON invites FOR UPDATE
  TO authenticated
  USING (invited_by = auth.uid() OR is_trip_creator(trip_id));
