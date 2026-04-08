# Supabase Setup Guide — On the GO!

## Step 1 — Create the project

1. Go to supabase.com → New Project
2. Name it `on-the-go`
3. Choose a strong database password (save it)
4. Region: US East (or closest to you)
5. Wait ~2 minutes for it to provision

## Step 2 — Run migrations (in order)

Go to **SQL Editor → New Query**, paste and run each file in order:

1. `migrations/001_initial_schema.sql`
2. `migrations/002_triggers.sql`
3. `migrations/003_rls_policies.sql`
4. `migrations/004_seed_destinations.sql`

Run them one at a time and confirm each succeeds before running the next.

## Step 3 — Configure Email Auth

1. Go to **Authentication → Providers → Email**
2. Enable **Email OTP** (not magic link)
3. Set OTP expiry to `3600` (1 hour)
4. Disable "Confirm email" (we handle this via OTP in-app)

## Step 4 — Configure Google Auth

1. Go to console.cloud.google.com → New Project → `on-the-go`
2. APIs & Services → OAuth consent screen → External
3. Credentials → Create OAuth Client ID → Web application
4. Authorized redirect URIs: add your Supabase callback URL:
   `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret
6. In Supabase → **Authentication → Providers → Google**
7. Paste Client ID and Client Secret → Save

## Step 5 — Configure Apple Auth

1. Go to developer.apple.com → Certificates, IDs & Profiles
2. Create a **Services ID** (e.g., `com.onthego.app.siwa`)
3. Enable **Sign In with Apple** and configure:
   - Domain: `YOUR_PROJECT_ID.supabase.co`
   - Return URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Create a **Key** with Sign In with Apple enabled → download the `.p8` file
5. In Supabase → **Authentication → Providers → Apple**
6. Fill in: Service ID, Team ID, Key ID, and paste the `.p8` contents → Save

## Step 6 — Add redirect URL

In Supabase → **Authentication → URL Configuration**:
- Add to "Redirect URLs": `onthego://auth/callback`

## Step 7 — Get your API keys

In Supabase → **Project Settings → API**:
- Copy **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Step 8 — Fill in your .env file

Copy `.env.example` to `.env` and paste the values from Step 7.
