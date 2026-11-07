# realty-website

A multilingual (Armenian, English, Russian) real-estate website with an admin panel, built with **Next.js** and **Payload CMS**. A personal learning project, running on free plans: Vercel Hobby, Neon Postgres and Vercel Blob.

## Run it locally

Requirements: Node 24 (`nvm use`), pnpm 10 (`corepack enable`), Docker.

```bash
pnpm install
pnpm db:up                  # local Postgres on port 5433 (docker compose)
cp .env.example .env.local  # then set PAYLOAD_SECRET (e.g. `openssl rand -hex 32`)
pnpm migrate                # create the database tables
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
| `pnpm typecheck`, `pnpm lint` | Checks (also run in CI) |
| `pnpm payload run scripts/check-upload.ts` | Upload a test photo and print the generated sizes |

## Branches

- `main`: production (Vercel production deployment)
- `develop`: staging (Vercel preview of the `develop` branch)
- No other branches: work is committed straight to `develop`, and `develop` is merged into `main` to release.

## Environment variables

See `.env.example`. On Vercel, `DATABASE_URL` is the Neon pooled connection string (Neon branch `main` for Production, `develop` for Preview) and `BLOB_READ_WRITE_TOKEN` from the Blob store; `PAYLOAD_SECRET` is set by hand per environment. The Blob store must be **Public** (Payload uploads with public access; the mode can't be changed after creation).
