# Dukanen (دكانين)

**Dukanen** is a mobile-first, multi-vendor marketplace built for South Sudan, with a product architecture designed to support future expansion across East Africa.

> **MVP status:** Pre-launch finalization. Core marketplace data, authentication, seller listings, product images, favorites, messaging, seller management, and protected account areas are connected to Supabase.

## Product vision

**Buy. Sell. Connect.**

Dukanen connects buyers, individual sellers, small businesses, shops, service providers, and marketplace administrators in one locally relevant marketplace.

## Implemented in the final UI/UX branch

- Mobile-first homepage and marketplace navigation
- Supabase-powered live marketplace listings
- Product detail pages with real product images and seller data
- User registration, login, safe return redirects, and session middleware
- Multi-photo listing creation with Supabase Storage
- SSP-first pricing and negotiable listings
- Favorites
- Buyer/seller conversations and messages
- Seller dashboard with real listing states, views, orders, and ratings
- Product view event tracking
- Protected profile, seller, and admin foundations
- Supabase Row Level Security policies and Storage policies
- Global loading, error, empty, and not-found states
- SEO robots and sitemap metadata
- GitHub Actions TypeScript + production build quality gate

## Technology

- Next.js 14 App Router
- React 18
- TypeScript with strict mode
- Supabase Auth, PostgreSQL, Storage, SSR, and Row Level Security
- GitHub Actions quality checks

## Local setup

### Requirements

- Node.js 20 or later
- npm
- A Supabase project

### Installation

```bash
git clone https://github.com/cyborg211/Dukanen-webapp-.git
cd Dukanen-webapp-
git checkout dukanen-final-uiux
npm install
cp .env.example .env.local
```

Add the public values from your Supabase project to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

For a new database, apply `supabase/schema.sql`. For the restored legacy Dukanen database, the Step 8 upgrade files document the migrations already applied to the connected project:

```text
supabase/step8_product_storage.sql
supabase/step8_legacy_schema_upgrade.sql
supabase/step8_secure_view_events.sql
```

Then start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run Next.js lint checks |

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/marketplace` | Browse live marketplace listings |
| `/product/[slug]` | View a live product |
| `/auth` | Register or sign in |
| `/sell` | Create a seller listing |
| `/favorites` | Saved listings |
| `/messages` | Buyer/seller conversations |
| `/profile` | Account profile |
| `/seller/dashboard` | Seller workspace |
| `/admin` | Protected admin foundation |

## Environment and security

- Never commit `.env.local` or production credentials.
- Use only a Supabase publishable/anon key in `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Never expose a Supabase service-role or secret key in browser code.
- Keep Row Level Security enabled on user-controlled tables.
- Product uploads are restricted to the authenticated user's Storage folder.
- The current connected Supabase project passes the Step 8 security-advisor check with no security lints.

## Launch rule

The `dukanen-final-uiux` branch is a preview candidate only until the Step 10 Vercel preview passes functional, mobile, data, and branding checks. Permanent production aliases and `dukanen.online` DNS should not be changed before approval.

## Product specification

See `docs/PRODUCT_SPECIFICATION.md` for the wider product direction and planned capabilities.

## Contributing

See `CONTRIBUTING.md` before submitting a change.
