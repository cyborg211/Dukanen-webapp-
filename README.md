# DukanEN (دكانين)

**Dukanen** is a mobile-first, multi-vendor marketplace built for South Sudan, with a product architecture designed to support future expansion across East Africa.

> **MVP status:** Active development. Core marketplace data, authentication, seller listing creation, product details, and protected seller/admin areas are connected to Supabase.

## Product vision

**Buy. Sell. Discover.**

Dukanen connects buyers, individual sellers, small businesses, shops, service providers, and marketplace administrators in one locally relevant marketplace.

## Implemented in the current MVP

- Mobile-first homepage and marketplace
- Supabase-powered marketplace listings
- Product detail pages loaded from Supabase
- User registration, login, and session middleware
- Live seller listing creation
- Protected seller dashboard
- Protected admin dashboard foundation
- Supabase schema and row-level security policies
- Reusable marketplace and navigation components

## Technology

- Next.js 14 App Router
- React 18
- TypeScript
- Supabase Auth and PostgreSQL
- Supabase SSR
- Lucide React

## Local setup

### Requirements

- Node.js 20 or later
- npm
- A Supabase project

### Installation

```bash
git clone https://github.com/cyborg211/Dukanen-webapp-.git
cd Dukanen-webapp-
npm install
cp .env.example .env.local
```

Add the public values from your Supabase project to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Apply [`supabase/schema.sql`](supabase/schema.sql) to the intended Supabase project, then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
| `/product/[slug]` | View a product |
| `/auth` | Register or sign in |
| `/sell` | Create a seller listing |
| `/seller/dashboard` | Seller workspace |
| `/admin` | Admin foundation |

## Project structure

```text
app/                 Next.js routes and server actions
components/          Shared interface components
lib/                 Data and Supabase clients
supabase/schema.sql  Database schema and RLS policies
docs/                Product documentation
middleware.ts        Supabase session middleware
```

## Environment and security

- Never commit `.env.local` or production credentials.
- The Supabase anon key may be used by the application only together with correctly tested row-level security policies.
- Never expose a Supabase service-role key in client-side code or any `NEXT_PUBLIC_` variable.
- Review [`SECURITY.md`](SECURITY.md) before reporting a vulnerability.

## Product specification

See [`docs/PRODUCT_SPECIFICATION.md`](docs/PRODUCT_SPECIFICATION.md) for the wider product direction and planned capabilities.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) before submitting a change.
