# realty-website

A multilingual (Armenian, English, Russian) real-estate website with an admin panel, built with **Next.js** and **Payload CMS**. A personal learning project, running on free plans: Vercel Hobby, Neon Postgres and Vercel Blob.

## Run it locally

Requirements: Node 24 (`nvm use`), pnpm 10 (`corepack enable`), Docker.

```bash
pnpm install
pnpm db:up                  # local Postgres on port 5433 (docker compose)
cp .env.example .env.local  # then set PAYLOAD_SECRET (e.g. `openssl rand -hex 32`)
pnpm migrate                # create the database tables
pnpm seed                   # optional: sample districts, agents and 300 listings with photos
pnpm dev                    # http://localhost:3000, admin at /admin
```

The first visit to `/admin` asks you to create the first admin user.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm build:vercel` | Run migrations, then build (Vercel uses this, see `vercel.json`) |
| `pnpm migrate:create <name>` | Create a migration after changing collections |
| `pnpm migrate` | Apply pending migrations |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` |
| `pnpm seed` | Sample content: 12 districts, 3 agents, 300 published listings with photos (safe to re-run) |
| `pnpm seed:staging` | The same, into the database and Blob store in `.env.staging` |
| `pnpm seed:live` | The same, into production (`.env.live`) |
| `ADMIN_EMAIL=… pnpm admin:create:live` | Before the first production deploy: apply migrations and create the first admin (prints a one-time password) |
| `pnpm typecheck`, `pnpm lint` | Checks (also run in CI) |
| `pnpm test:int` | Integration tests: roles and listing rules (needs the database; also run in CI) |
| `pnpm payload run scripts/check-upload.ts` | Upload a test photo and print the generated sizes |

## Branches

- `main`: production (Vercel production deployment)
- `develop`: staging (Vercel preview of the `develop` branch)
- No other branches: work is committed straight to `develop`, and `develop` is merged into `main` to release.

## Environment variables

See `.env.example`. On Vercel, `DATABASE_URL` is the Neon pooled connection string (Neon branch `main` for Production, `develop` for Preview) and `BLOB_READ_WRITE_TOKEN` from the Blob store; `PAYLOAD_SECRET` is set by hand per environment. The Blob store must be **Public** (Payload uploads with public access; the mode can't be changed after creation).

## Sample content on staging

`pnpm seed:staging` reads `.env.staging` (gitignored, like every `.env*` file) instead of `.env.local`:

```bash
DATABASE_URL=     # Neon branch preview/develop, pooled connection string
BLOB_READ_WRITE_TOKEN=   # the Public Blob store's read-write token
```

The seed prints the database host before writing, and stops if `.env.staging` still points at this machine or has no Blob token. Photos come from Unsplash (free licence) and are processed into the Payload image sizes on your machine, then uploaded to Blob.

## Production database

Production scripts read `.env.live` (not `.env.production`: Next loads that file by itself for local production builds, which would point them at the real database). It holds the production `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` and `PAYLOAD_SECRET`, the same values as in Vercel's Production environment.

Before the first deploy, run `ADMIN_EMAIL=you@example.com pnpm admin:create:live`. On an empty database Payload offers a public "create first user" form whose account becomes an admin; the script applies the migrations and creates your admin first, so that form never appears.
