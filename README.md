# Guilt-Free Budget

A one-file budget planner. Enter your salary, add fixed expenses and spending
budgets, and the sticky bar at the bottom always shows what's left to spend
guilt-free. Everything is free to run.

## How the math works

- **Fixed expenses** (rent, insurance…) come off your salary the moment you add them.
- **Spending budgets** (food, fuel…) set their full limit aside up front, so the
  guilt-free number is money you can *always* safely spend.
- Log purchases against a budget as the month goes. When you're done with a
  budget, hit **Settle** — whatever you didn't spend moves into guilt-free.
- Go over a limit and the excess automatically comes out of guilt-free.
- **Start a new month** wipes everything and asks for a fresh salary.

## Run it

Just open `index.html` in any browser. Data is saved on that device automatically.

## Put it online for free (reachable anywhere)

**GitHub Pages** (simplest):
1. Create a free account at github.com, then a new **public** repository.
2. Upload `index.html` (drag & drop via "Add file → Upload files").
3. Repo → Settings → Pages → Source: "Deploy from a branch" → branch `main`, folder `/ (root)` → Save.
4. After ~1 minute your app is live at `https://YOURNAME.github.io/REPONAME/`.
   Open that URL on your phone and "Add to Home Screen" — it behaves like an app.

**Cloudflare Pages** (alternative): dash.cloudflare.com → Workers & Pages →
Create → Pages → Upload assets → drop `index.html` → deploy. Done.

## Enable cross-device sync (optional, ~5 minutes, free)

Without this, each device keeps its own data. With it, your phone and laptop
share one budget, protected by your email.

1. Create a free project at **supabase.com** (free tier, no card needed).
2. In your project: **SQL Editor → New query**, paste and run:

   ```sql
   create table budget_state (
     user_id uuid primary key references auth.users(id) on delete cascade,
     data jsonb not null,
     updated_at timestamptz default now()
   );
   alter table budget_state enable row level security;
   create policy "own data" on budget_state
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```

   (Row Level Security means only *you*, signed in with your email, can read
   or write your row — the key in the file can't expose your data.)

3. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
4. Open `index.html` and paste them into the two constants near the top:

   ```js
   const SUPABASE_URL = "https://xxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJ...";
   ```

5. **Authentication → URL Configuration**: set *Site URL* to your deployed
   address (e.g. `https://yourname.github.io/budget/`).
6. Re-upload `index.html`, open the app, enter your email in the sync strip,
   click the magic link it sends you. Repeat the sign-in once on each device —
   from then on they stay in sync (newest change wins).

## Notes

- Amounts accept cents with comma or dot: `1450,50`, `1.234,56`, `12.4` all work.
- Your data is a few kilobytes — you will never hit any free-tier limit.
- Ideas for later: editing a budget's limit in place, keeping an archive of past months.
