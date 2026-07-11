# Rox Cleaning — CRM

Internal CRM for Rox Cleaning. Built with **Next.js (App Router) + Supabase** (Postgres, Auth, Row Level Security). Deploys to Vercel.

## Features

- **Login & roles** — first account = owner (**admin**); everyone else = **staff** (cleaners see only their own schedule).
- **Leads** — estimate requests from the website land here automatically; change status, convert a lead into a client.
- **Clients** — full contact records, notes, history of cleanings and invoices.
- **Schedule** — book cleanings, assign to staff, recurring (weekly/bi-weekly/monthly), mark done.
- **Quotes & Invoices** — line items, totals, tax, printable, status (draft → sent → paid).
- **Team** — promote/demote admins.

## One-time setup (≈10 minutes)

### 1. Create a free Supabase project
1. Go to <https://supabase.com> → **New project**. Pick a name and a strong database password.
2. When it's ready, open **Project Settings → API** and copy:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** key

### 2. Create the database
1. In Supabase, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
   This creates all tables, the auto-profile trigger, and security rules.

### 3. Deploy on Vercel
1. Put this folder in its own GitHub repo (e.g. `roxcleaning-crm`).
2. On Vercel → **Add New → Project** → import that repo.
3. Add two Environment Variables (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon public key
4. **Deploy**.

### 4. Create the owner account
- Open the deployed CRM URL → **Create an account**. The **first** account automatically becomes the **admin/owner**.
- (Optional) In Supabase → **Authentication → Providers → Email**, turn **off** "Confirm email" for instant sign-in.

### 5. Connect the website form (leads → CRM)
So website estimate requests appear under **Leads**, add the same two env vars to the **website** (roxcleaning) Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The estimate form inserts each submission into the `leads` table (allowed for anonymous visitors by a strict insert-only policy) while still emailing you via Web3Forms as a backup.

## Local development

```bash
cp .env.example .env.local   # fill with your Supabase URL + anon key
npm install
npm run dev                  # http://localhost:3000
```

## Security model (Row Level Security)

- **admin** — full access to everything.
- **staff** — read clients, read leads, and read/update **only** the cleanings assigned to them. No access to invoices or team management.
- **anonymous (website)** — may only INSERT leads. Cannot read anything.

Roles live in the `profiles.role` column and are enforced in the database, not just the UI.
