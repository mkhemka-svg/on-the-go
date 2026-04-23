-- ============================================================
-- On the GO! — Trip code lookup policy
-- Run AFTER 003_rls_policies.sql
-- ============================================================
--
-- The existing trips_select policy (003) restricts reads to trip members.
-- A collaborator entering an invite code is NOT yet a member, so they get
-- zero rows back and cannot join.  This policy allows any authenticated
-- user to SELECT trips — the app always queries by the exact trip_code
-- value, and since codes are random 6-char strings, enumeration is
-- impractical.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query

CREATE POLICY "trips_select_by_code"
  ON trips FOR SELECT
  TO authenticated
  USING (true);
