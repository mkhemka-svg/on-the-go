-- ============================================================
-- On the GO! — Initial Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Enums ───────────────────────────────────────────────────

CREATE TYPE auth_provider   AS ENUM ('email', 'google', 'apple');
CREATE TYPE member_role     AS ENUM ('creator', 'collaborator');
CREATE TYPE vote_value      AS ENUM ('like', 'dislike', 'skip');
CREATE TYPE invite_status   AS ENUM ('pending', 'accepted', 'declined');

-- ── profiles ────────────────────────────────────────────────
-- Mirrors auth.users; one row per signed-up user.
-- Automatically created by the trigger below.

CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  name        TEXT        NOT NULL DEFAULT '',
  avatar_url  TEXT,
  provider    auth_provider NOT NULL DEFAULT 'email',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── destinations ─────────────────────────────────────────────

CREATE TABLE destinations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  country     TEXT        NOT NULL,
  image_url   TEXT,
  is_trending BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── trips ────────────────────────────────────────────────────

CREATE TABLE trips (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  destination_id  UUID        REFERENCES destinations(id) ON DELETE SET NULL,
  start_date      DATE,
  end_date        DATE,
  trip_code       TEXT        NOT NULL UNIQUE,
  creator_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast trip-code lookups (join via invite flow)
CREATE INDEX idx_trips_trip_code ON trips(trip_code);

-- ── trip_members ─────────────────────────────────────────────

CREATE TABLE trip_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        member_role NOT NULL DEFAULT 'collaborator',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

CREATE INDEX idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user_id ON trip_members(user_id);

-- ── itinerary_items ──────────────────────────────────────────

CREATE TABLE itinerary_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_by      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT,
  scheduled_date  DATE,
  scheduled_time  TIME,
  attachment_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_itinerary_items_trip_id ON itinerary_items(trip_id);

-- ── votes ────────────────────────────────────────────────────

CREATE TABLE votes (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_item_id   UUID        NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
  user_id             UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value               vote_value  NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (itinerary_item_id, user_id)   -- one vote per user per item
);

CREATE INDEX idx_votes_itinerary_item_id ON votes(itinerary_item_id);

-- ── invites ──────────────────────────────────────────────────

CREATE TABLE invites (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID          NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  invited_by  UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email       TEXT          NOT NULL,
  status      invite_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (trip_id, email)   -- prevent duplicate invites to same email per trip
);

CREATE INDEX idx_invites_trip_id ON invites(trip_id);
CREATE INDEX idx_invites_email   ON invites(email);
