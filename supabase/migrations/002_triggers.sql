-- ============================================================
-- On the GO! — Triggers & Functions
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ── Auto-create profile on sign-up ───────────────────────────
-- Fires whenever a new row is inserted into auth.users
-- (covers email, Google, and Apple sign-in)

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'::auth_provider
      WHEN NEW.app_metadata->>'provider' = 'apple'  THEN 'apple'::auth_provider
      ELSE 'email'::auth_provider
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── Auto-add creator as trip_member on trip creation ─────────

CREATE OR REPLACE FUNCTION handle_new_trip()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trip_members (trip_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_trip_created
  AFTER INSERT ON trips
  FOR EACH ROW EXECUTE PROCEDURE handle_new_trip();

-- ── Generate unique 6-character trip code ────────────────────

CREATE OR REPLACE FUNCTION generate_trip_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no ambiguous chars (0,O,1,I)
  code  TEXT := '';
  i     INT;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
    END LOOP;
    -- Ensure uniqueness
    EXIT WHEN NOT EXISTS (SELECT 1 FROM trips WHERE trip_code = code);
  END LOOP;
  RETURN code;
END;
$$;
