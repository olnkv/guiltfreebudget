# Guilt-Free Budget

A single-page monthly budgeting tool. Start a month with your income, take off
what's committed, set money aside for spending categories, and whatever remains
is yours to spend without guilt. See [`CONTEXT.md`](CONTEXT.md) for the domain
glossary.

The entire app is one self-contained file: [`index.html`](index.html). No build
step, no framework, no bundler.

## Run it

Just open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

Data is stored on the device (localStorage) by default. Cross-device sync is
optional — see below.

## Deploy

Hosted on **GitHub Pages** from `main` at the repo root. Every push to `main`
redeploys automatically; `index.html` at the root is the entry point.

- Live site: https://olnkv.github.io/guiltfreebudget/
- To enable Pages on a fork: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.

## Tests

The app ships as one file, but there's a dev-only test harness (jsdom) that
loads the real `index.html` and exercises its shipped `totals` / `parseMoney`
globals — no source is extracted, and nothing here is served to users.

```sh
npm install
npm test
```

## Optional cross-device sync (Supabase, free tier)

Leave `SUPABASE_URL` / `SUPABASE_ANON_KEY` empty (top of `index.html`) and the
app runs device-only. To sync your phone and laptop, set up a free Supabase
project — about 5 minutes.

### 1. Create the project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. **Authentication → Providers → Email**: make sure Email is enabled. The app
   signs in with magic links (one-time email links), so no passwords are needed.
3. **Authentication → URL Configuration**: add your site URL (e.g.
   `https://<you>.github.io/guiltfreebudget/`) to the redirect allow-list, plus
   `http://localhost:8000` if you test locally.

### 2. Create the table and lock it down with RLS

Open **SQL Editor** and run this once. It creates the one-row-per-user table the
app expects (`budget_state` with `user_id`, `data`, `updated_at`) and enables
**Row Level Security** so each signed-in user can only ever touch their own row.

```sql
-- One row of budget state per user.
create table if not exists public.budget_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Turn RLS ON. With RLS enabled and no matching policy, every request is denied
-- by default — so the anon key exposed in the deployed page can read nothing.
alter table public.budget_state enable row level security;

-- A user may read only their own row.
create policy "read own budget"
  on public.budget_state for select
  to authenticated
  using (auth.uid() = user_id);

-- A user may create only a row that belongs to them.
create policy "insert own budget"
  on public.budget_state for insert
  to authenticated
  with check (auth.uid() = user_id);

-- A user may update only their own row, and can't reassign it to someone else.
create policy "update own budget"
  on public.budget_state for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- (Optional) allow a user to delete their own row.
create policy "delete own budget"
  on public.budget_state for delete
  to authenticated
  using (auth.uid() = user_id);
```

### 3. Wire up the app

Copy your project's **URL** and **anon public key** from
**Project Settings → API**, and paste them into the two constants near the top
of `index.html`:

```js
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "eyJ...your-anon-key...";
```

Commit and push. On the deployed site, enter your email, click the magic link,
and your budget syncs across devices.

### Why it's safe to commit the anon key

The anon key is **designed to be public** — it identifies the project, not a
user, and carries no privileges of its own. All access is gated by the RLS
policies above: an unauthenticated request (all the anon key alone can make)
matches no policy and is denied, and an authenticated request only ever sees
rows where `auth.uid() = user_id`. Never commit the **service role** key, which
bypasses RLS.

To verify the lockdown yourself, an unauthenticated read returns an empty list
and an unauthenticated write is rejected:

```sh
curl "$SUPABASE_URL/rest/v1/budget_state?select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY"
# -> []   (RLS hides everything from an anonymous caller)
```
