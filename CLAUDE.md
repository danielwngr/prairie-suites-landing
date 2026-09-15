# Context for working on this project

This file carries context forward for future Claude Code sessions on this
repo, since a new session has no memory of how or why this was built.

## What this is

A landing page for Prairie Suites, a grooming salon suites business, ahead
of new locations opening in the Southwest Metro (Minneapolis area) in 2027.
The only real functionality is a lead-capture form: visitors leave their
name/email/phone and say whether they're a prospective tenant or just want
updates. There's no admin UI, no email notifications, no scoring logic,
nothing else going on. See README.md for setup and deploy steps.

This was deliberately built simple and free-tier (static HTML/CSS/JS +
one Vercel serverless function + one Supabase table), matching the "don't
over-engineer a small personal/small-business project" approach used on
other projects built this way (e.g. a wing foiling conditions dashboard for
the same person). Don't add a frontend framework, build step, or admin
dashboard unless actually asked for.

## Things to know

- **The form posts to `/api/subscribe`** (`api/subscribe.js`), a single
  Vercel serverless function. It validates name/email, applies a honeypot
  check (`company` field, hidden from real users via CSS), and inserts into
  Supabase's `leads` table using the service role key (bypasses RLS, which
  is why RLS is enabled with no public policies in `supabase/schema.sql`,
  the insert never goes through the anon key).
- **`interest_type`** is constrained server-side to `tenant` / `updates` /
  `other` (both in the DB check constraint and in `api/subscribe.js`'s
  allowlist) - if any value outside that set comes in, it's coerced to
  `other` rather than rejected.
- **No git repo has been initialized here yet.** This was scaffolded as
  plain files in a new folder on Desktop; if you're starting fresh, `git
  init`, a first commit, and pushing to a private GitHub repo would be a
  good idea before this is the only copy anywhere.
- **No Vercel or Supabase project is linked/created yet either.** Both need
  to be set up (see README.md "Deploying" and "Local setup") before this
  can actually go live or be tested end to end with a real database.
- **No custom domain is registered yet.** Whoever owns this business will
  need to buy one and point it at Vercel per the README's instructions.
- **No test suite.** Validate changes by running `vercel dev` locally and
  exercising the form in a browser; there's nothing more automated than
  that, on purpose (matches the same convention used elsewhere).

## Known outstanding items (as of this file's writing)

- Supabase project, Vercel project, and a custom domain all still need to
  be created and connected. Nothing has been deployed yet.
- No copy/design has been finalized beyond a neutral placeholder look
  (no logo, no brand colors). Update `style.css` and `index.html` once
  branding exists.
- Consider whether the lead capture needs a confirmation email back to the
  submitter, or a notification email to whoever manages leasing, once this
  is live and actual submissions start coming in. Neither exists yet.
