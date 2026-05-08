# VPS Deployment Guide

This app runs as two containers (Next.js + Postgres) behind nginx. Real-time notifications use Postgres `LISTEN/NOTIFY` over Server-Sent Events, so it requires a long-lived Node process — **do not deploy this on Vercel serverless**.

Target capacity: ~100k users on a single VPS (4 vCPU / 8 GB RAM is plenty).

---

## 1. Prerequisites on the VPS

Tested on Ubuntu 22.04 / Debian 12. Adjust for your distro.

```bash
# Docker + compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out/in to apply
sudo apt install -y docker-compose-plugin nginx

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. Clone and configure

```bash
git clone <your-repo> /opt/next-level
cd /opt/next-level
cp .env.example .env
```

Edit `.env` and set real values:

```bash
POSTGRES_USER=nextlevel
POSTGRES_PASSWORD=$(openssl rand -base64 32)   # paste the output
POSTGRES_DB=nextlevel
POSTGRES_PORT=5432

WEB_PORT=3000

JWT_SECRET=$(openssl rand -base64 64)          # paste the output
```

The compose file enforces `POSTGRES_PASSWORD` and `JWT_SECRET` — it won't start without them.

> **Postgres port:** the compose file exposes 5432 to the host by default. If you don't need external DB access, edit `docker-compose.yml` and remove the `ports:` block under `postgres` (the web container reaches it over the internal network).

---

## 3. Build and start

```bash
docker compose up -d --build
docker compose logs -f web   # watch the boot — prisma migrate deploy runs on start
```

The web container runs `prisma migrate deploy && npm start` on boot, which applies:
- `20260508000000_init_postgres` — schema
- `20260508000001_notification_trigger` — `pg_notify` trigger on the `Notification` table

Health check:
```bash
curl http://localhost:3000/api/auth/me   # should return 401 unauthenticated
```

---

## 4. Nginx reverse proxy (with SSE-friendly config)

SSE needs `proxy_buffering off` and a long read timeout, otherwise nginx will buffer notification events and clients will look "stuck".

`/etc/nginx/sites-available/next-level`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Generic: app routes
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # SSE: notifications stream — disable buffering, long timeouts
    location /api/notifications/stream {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 1h;
        proxy_send_timeout 1h;
        chunked_transfer_encoding off;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/next-level /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### TLS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot auto-renews via systemd timer.

---

## 5. Updating the app

```bash
cd /opt/next-level
git pull
docker compose up -d --build web
```

Migrations run automatically on container start (`prisma migrate deploy`). New notification types or schema changes only require dropping a new migration file under `apps/web/prisma/migrations/` and rebuilding.

---

## 6. Backups

Daily logical dump cron — `/etc/cron.daily/postgres-backup`:

```bash
#!/bin/bash
set -e
mkdir -p /var/backups/postgres
docker compose -f /opt/next-level/docker-compose.yml exec -T postgres \
  pg_dump -U nextlevel nextlevel \
  | gzip > /var/backups/postgres/nextlevel-$(date +%F).sql.gz
find /var/backups/postgres -name 'nextlevel-*.sql.gz' -mtime +14 -delete
```

```bash
sudo chmod +x /etc/cron.daily/postgres-backup
```

Restore:
```bash
gunzip -c nextlevel-2026-05-08.sql.gz | \
  docker compose exec -T postgres psql -U nextlevel nextlevel
```

The `postgres_data` named volume also persists across container rebuilds; only `docker compose down -v` would wipe it.

---

## 7. Notifications: how it works

```
admin approves investment
        │
        ▼
prisma.$transaction:
  - update investment
  - create cycle
  - create transaction
  - create notification    ◄── single row insert
        │
        ▼
Postgres trigger fires NOTIFY 'new_notification', userId
        │
        ▼
Node singleton LISTEN client (lib/notifications/listener.ts)
        │
        ▼
SSE stream pushes "new" event to that user's open connections
        │
        ▼
Browser EventSource receives "new" → refetches /api/notifications
```

**Key properties:**
- Notifications are durable. A user offline at the moment of the event still sees it on next page load.
- The LISTEN client is a singleton inside the Node process (`globalThis.__notifListener`). One TCP connection to Postgres handles all SSE clients.
- Auto-reconnect with exponential backoff if the LISTEN connection drops.
- SSE heartbeat every 25s to keep proxies from killing idle connections.

**Scaling note:** if you ever run multiple `web` replicas, each one will hold its own LISTEN connection. That works fine — every replica receives every notify, and only forwards to its locally-connected SSE clients. No Redis needed at this scale.

---

## 8. Operations cheat sheet

```bash
# Tail logs
docker compose logs -f web
docker compose logs -f postgres

# Restart just the web app (config or env change)
docker compose restart web

# Open a psql shell
docker compose exec postgres psql -U nextlevel nextlevel

# Run a one-off prisma command in the web container
docker compose exec web npx prisma migrate status
docker compose exec web npx prisma studio   # if needed (binds 5555)

# Disk usage
docker system df

# Wipe and start fresh (DESTROYS DATA)
docker compose down -v
```

---

## 9. Security checklist before going live

- [ ] `JWT_SECRET` and `POSTGRES_PASSWORD` are unique, long, and random — not the example values.
- [ ] `.env` at the repo root is in `.gitignore` (it is, by default). Confirm `git status` shows it untracked.
- [ ] Postgres port (`5432`) is **not** exposed to the public internet. Either remove the `ports:` block in `docker-compose.yml` or restrict via firewall.
- [ ] HTTPS enabled (certbot above).
- [ ] Backups verified by doing a restore at least once on a staging instance.
- [ ] Outstanding items from the security audit (CSRF, rate limits on writes, txHash on-chain verification, audit logging, 2FA for admins) tracked separately.
