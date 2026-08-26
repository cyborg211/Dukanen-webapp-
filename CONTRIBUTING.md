# Contributing to Dukanen

Thank you for helping improve Dukanen.

## Before making a change

1. Check the product direction in `docs/PRODUCT_SPECIFICATION.md`.
2. Keep the experience mobile-first and suitable for low-bandwidth connections.
3. Do not remove existing features without an approved replacement.
4. Never commit credentials, environment files, private user data, or production exports.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use a development Supabase project and apply `supabase/schema.sql`.

## Branches

Create a focused branch from `main`:

- `feat/short-description`
- `fix/short-description`
- `docs/short-description`

## Quality checks

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

Test authentication, marketplace browsing, seller listing creation, product details, and role-protected pages when your change affects those areas.

## Pull requests

A pull request should:

- Explain the problem and the chosen solution
- List the routes or database objects affected
- Include screenshots for visible interface changes
- Include migration and rollback notes for schema changes
- Confirm that no secrets or personal data were added
- Keep unrelated changes out of the same pull request
