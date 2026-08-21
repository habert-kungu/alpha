# Deploying AlphaReserve

The web app is a Next.js (standalone) container backed by a SQLite database on a
persistent volume. Everything builds from the repo root.

## Prerequisites

- Docker with Compose v2 (`docker compose ...`)
- A strong `JWT_SECRET` (auth **fails closed** in production without one)

## Quick start

```bash
# 1. Provide required secrets (a .env file next to docker-compose.yml works too)
export JWT_SECRET="$(openssl rand -base64 32)"

# 2. Build and run
docker compose up -d --build

# 3. Open the app
open http://localhost:3000
```

The first boot copies a **migrated + seeded** database onto the `alphareserve-data`
volume. Subsequent boots reuse that volume, so your data persists across
redeploys. Rebuilding the image never overwrites an existing volume.

## Default seeded accounts

The baked database ships with two demo accounts — **change these before going
live** (rotate the admin password, or start from a clean volume and sign up):

| Role  | Email                  | Password   |
| ----- | ---------------------- | ---------- |
| Admin | `admin@nextlevel.com`  | `admin123` |
| User  | `test@nextlevel.com`   | `user123`  |

To start with an empty database instead, remove the volume before first run
(`docker volume rm trade_alphareserve-data`) and comment out the `db:seed` step
in the `Dockerfile` builder stage.

## Environment variables

| Variable                       | Required | Notes                                              |
| ------------------------------ | -------- | -------------------------------------------------- |
| `JWT_SECRET`                   | **Yes**  | ≥16 chars. Auth throws in production if unset.     |
| `DATABASE_URL`                 | preset   | `file:/data/prod.db` (on the volume). Leave as-is. |
| `PUSHER_*` / `NEXT_PUBLIC_PUSHER_*` | No  | Real-time notifications. Unset = feature disabled. |

## Updating / redeploying

```bash
git pull
docker compose up -d --build   # data on the volume is preserved
```

## Building the image directly (without Compose)

```bash
docker build -t alphareserve-web .
docker run -d -p 3000:3000 \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  -v alphareserve-data:/data \
  alphareserve-web
```

## Notes

- **Database choice**: SQLite is simple and fine for a single-instance
  deployment. For horizontal scaling, migrate `apps/web/prisma/schema.prisma` to
  PostgreSQL and point `DATABASE_URL` at a managed database (the Prisma models
  are portable; only the datasource `provider` and `DATABASE_URL` change).
- **Schema changes**: edit `apps/web/prisma/schema.prisma` and rebuild — the
  builder runs `prisma db push` to sync the baked DB to the schema. (This repo
  tracks schema via `db push`, not a migration history.)
- **Health check**: Compose probes `/login`; the container is marked healthy
  once the server responds.
