# Context for working on this project

This file carries context forward for future Claude Code sessions on this
repo, since a new session has no memory of how or why this was built. Read
this before making changes.

## What this is

A landing page for Prairie Suites, a **pet grooming** salon suites
business (private, fully equipped suites leased to independent pet
groomers), ahead of its first location opening in the Southwest Metro
(Minneapolis area) in 2027. The page is now solely a tenant-interest form
aimed at prospective groomers, not a general "keep me updated" signup. See
README.md for local setup and deploy steps.

**This is pet grooming, not a human hair/barber salon.** An early version
of this page mistakenly used human hair-salon stock photos (chairs,
mirrors, a stylist blow-drying a person's hair) before being corrected.
Don't reintroduce human-salon imagery, copy, or icons (scissors-on-hair,
barber chairs, etc.) - the target audience is dog/cat groomers.

This was deliberately built simple and free-tier (static HTML/CSS/JS +
one Vercel serverless function + one Supabase table), matching the "don't
over-engineer a small personal/small-business project" approach used on
other projects built this way (e.g. a wing foiling conditions dashboard for
the same person). Don't add a frontend framework, build step, or admin
dashboard unless actually asked for.

## Current state (live and deployed)

- **GitHub**: `https://github.com/danielwngr/prairie-suites-landing`
  (private repo), `master` branch. Push to `master` and Vercel
  auto-redeploys (it's connected via Vercel's GitHub integration, set up
  through the Vercel dashboard's "Import Git Repository" flow, **not**
  `vercel link`/CLI - there is no `.vercel/` folder in this repo).
- **Vercel project**: created under the `danielwngr` Vercel account (signed
  in via "Continue with GitHub"). Environment variables `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` are set in the Vercel dashboard under
  Settings -> Environment Variables. If either is ever missing, the
  `/api/subscribe` function will fail at the Supabase client call - if you
  add/change env vars in the dashboard, remember deployments must be
  **redeployed** afterward for the new values to take effect (existing
  deployments don't pick up new env vars retroactively).
- **Supabase project**: URL `https://zntadxcnnngqmdrnombx.supabase.co`. The
  `leads` table has been created and migrated forward several times by
  re-running `supabase/schema.sql` in the SQL Editor (it's idempotent, safe
  to re-run any time - always the source of truth for what the table
  should look like). `SUPABASE_SERVICE_ROLE_KEY` is a newer-style
  `sb_secret_...` key (Supabase's newer API key system), not a legacy JWT.
- **No custom domain yet.** Still on Vercel's default `*.vercel.app` URL.
- **`.env.local` exists locally** with real Supabase credentials, for
  `vercel dev`/local testing. It's gitignored on purpose - a fresh
  `git clone` of the GitHub repo will NOT include it. If you're picking
  this project up somewhere new, either copy this folder as-is (env file
  included) or pull the values from the Vercel dashboard's Environment
  Variables page and recreate `.env.local` from `.env.local.example`.

## Things to know

- **The form posts to `/api/subscribe`** (`api/subscribe.js`), a single
  Vercel serverless function. It validates name/email, applies a honeypot
  check (`company` field, hidden from real users via CSS), and inserts into
  Supabase's `leads` table using the service role key (bypasses RLS, which
  is why RLS is enabled with no public policies in `supabase/schema.sql` -
  the insert never goes through an anon key, there isn't one in use here).
- **`interest_type` is hardcoded server-side to `'tenant'`.** There used to
  be a tenant/updates/other dropdown on the form; it was removed because
  the page is now solely a groomer/tenant interest form. The DB check
  constraint still allows `'updates'`/`'other'` only so any old rows from
  before that change stay valid - don't read too much into that, new rows
  are always `'tenant'`.
- **Current form fields** (all optional except name/email): name, email,
  phone, `experience` (years grooming, dropdown), `employment_type`
  (dropdown: independent/self-employed, salon-employed, pet-retailer
  employed, mobile, not currently grooming, other - a *category*, not the
  name of their employer), `portfolio_url` (Instagram/website),
  `timeline` (move-in urgency, dropdown), `client_base` (existing client
  count, dropdown), `services` (multi-select checkboxes -> stored as a
  Postgres `text[]`), `referral_source` (how they heard about Prairie
  Suites, dropdown), `message` (free text).
- **`current_workplace` column is deprecated/unused.** It used to be a
  free-text "where do you currently groom" field; replaced by the
  `employment_type` dropdown above (category, not employer name). Left in
  the schema rather than dropped since dropping is destructive for no real
  benefit - don't resurrect it in the form without discussing first.
- **No git-tracked build step.** Static HTML/CSS/JS, no bundler. Validate
  JS changes with `node --check <file>.js` before considering a change
  done (matches the esbuild-validation convention used on other projects
  built this way) - there is no automated test suite here either.
- **Images are free-license stock photos** (Pexels, no attribution
  required), self-hosted in `/images` rather than hotlinked, as
  placeholders until real photos of the actual space/groomers exist.
  Verify any new stock photo's actual content before using it (download
  and view it, don't trust a filename/alt-text guess) - this bit the
  project once already with the human-salon mixup above.
- **No admin UI.** To see submissions, query the Supabase `leads` table
  directly (Table Editor in the dashboard, or a REST call with the
  `apikey`/`Authorization: Bearer` headers set to the service role key
  against `https://zntadxcnnngqmdrnombx.supabase.co/rest/v1/leads`).

## Continuity notes (handing this project to a new session/account)

Same situation as other projects built this way: a Claude Code session has
no persistent credentials of its own and no memory between sessions. What
actually carries forward is (a) this repo's files, especially this one,
and (b) whichever human accounts you still control:

- **GitHub**: `danielwngr` owns the repo. A new machine/session needs your
  GitHub login (or an SSH key/PAT) to push - `git push` here relies on
  Windows' Git Credential Manager, which will prompt a browser login the
  first time on a new machine.
- **Vercel**: project lives under the `danielwngr` Vercel account,
  connected to GitHub for auto-deploy. No CLI login was ever set up for
  this project (unlike some other projects built this way) - everything
  was done through the Vercel web dashboard. A new session can keep doing
  it that way; there's nothing to "reconnect" locally.
- **Supabase**: project and its credentials belong to whoever's Supabase
  login was used to create it - not tied to any Claude account.
- None of the above needs to change just because a different Claude
  account is being used. Point a new session at this folder (or a fresh
  `git clone` of the GitHub repo, keeping in mind the `.env.local` caveat
  above), have it read this file and README.md, and it has everything the
  previous session had.

## Known outstanding items (as of this file's writing)

- No custom domain purchased/connected yet.
- No confirmation email to the submitter or notification email to the
  business owner when a new lead comes in - submissions currently just
  sit in the `leads` table until someone checks Supabase manually. Worth
  adding once real submissions start coming in and checking manually
  becomes tedious.
- No copy/design has been finalized beyond a neutral placeholder look
  (no logo, no brand colors) - Poppins/Inter fonts and a blue-gray accent
  color are placeholder choices, not a finalized brand.
