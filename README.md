# Prairie Suites Landing Page

A single-page landing site announcing Prairie Suites' new grooming salon
suite locations coming to the Southwest Metro in 2027, with a form for
prospective tenants and interested subscribers to leave their contact info.

Deliberately simple and free-tier: static HTML/CSS/JS front end, one Vercel
serverless function, one Supabase table. No build step, no framework.

## Stack

- **Frontend**: plain `index.html` / `style.css` / `script.js`, no build tool.
- **Backend**: one Vercel serverless function, `api/subscribe.js`, that
  validates the form submission and inserts it into Supabase.
- **Database**: Supabase Postgres, single `leads` table (see
  `supabase/schema.sql`).
- **Hosting**: Vercel (free tier).

## Local setup

1. Create a Supabase project (free tier is fine) at supabase.com.
2. In the Supabase SQL Editor, run `supabase/schema.sql`. It's idempotent,
   safe to re-run any time.
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `SUPABASE_URL` (Project Settings -> API -> Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings -> API -> service_role
     secret key). This key bypasses row-level security, so never expose it
     to the frontend; it's only ever read server-side in `api/subscribe.js`.
4. `npm install`
5. `npm run dev` (runs `vercel dev`, which serves both the static files and
   the `/api/subscribe` function locally, reading `.env.local`
   automatically). Requires the Vercel CLI to be installed and logged in
   (`npm i -g vercel`, then `vercel login`).

## Deploying

1. `vercel link` once, to connect this folder to a Vercel project.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the Vercel
   project's dashboard under Settings -> Environment Variables (these are
   separate from your local `.env.local`; Vercel doesn't read that file in
   production).
3. `vercel --prod` to deploy.
4. To use a custom domain, buy one (Namecheap, Google Domains, etc.), then
   add it under the Vercel project's Settings -> Domains and follow the DNS
   instructions Vercel gives you.

## Viewing submissions

Every form submission lands in the `leads` table in Supabase. Easiest way
to check them: Supabase dashboard -> Table Editor -> `leads`. There's no
admin page in this project (unlike the wing foil dashboard this pattern is
borrowed from) since this is just a single lead-capture form, not an
ongoing content-management app. If this grows into something needing an
admin view, filtering, or CSV export, that would be a reasonable next
addition.

## Spam protection

The form has a hidden honeypot field (`company`). Real users never see or
fill it in; if it arrives non-empty, the server pretends success but
doesn't write to the database. This is a lightweight deterrent, not
bulletproof. If spam becomes a real problem, adding something like
Cloudflare Turnstile (free) would be the next step.

## No test suite

Same convention as other projects built this way: there's no Jest/Playwright
setup here. Validate changes to `api/subscribe.js` by running `vercel dev`
locally and submitting the form; validate `index.html`/`script.js` changes
by opening the page in a browser.
