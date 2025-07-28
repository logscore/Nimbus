# 🚀 Deployment Guide

## Table of Contents

- [Docker Compose Deployment](#docker-compose-deployment)
- [Cloudflare Workers Deployment](#cloudflare-workers-deployment)

---

## 🐳 Docker Compose Deployment

This is the simplest way to deploy Nimbus locally or on a single server.

To make it even simpler, we recommend using [Coolify](https://coolify.io/).

### Prerequisites

- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the Repository

```bash
git clone https://github.com/nimbusdotstorage/Nimbus.git
cd Nimbus
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env

```

Nimbus requires the following environment variables to work, some will be pre-filled for local testing:

**REQUIRED**:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `SERVER_PORT`
- `WEB_PORT`
- `BACKEND_URL`
- `TRUSTED_ORIGINS`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_FRONTEND_URL`
- `DATABASE_URL`
- `DATABASE_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `VALKEY_PORT`
- `VALKEY_HOST`
- `VALKEY_USERNAME`
- `VALKEY_PASSWORD`

**OPTIONAL**:

- `EMAIL_FROM`
- `RESEND_API_KEY`

### 3. Start Services

```bash
docker compose up -d
```

### 4. Verify Services

- Web UI: http://localhost:3000
- Server API: http://localhost:1284
- PostgreSQL: localhost:5432
- Valkey (Redis-compatible): localhost:6379

### 5. Stop Services

```bash
docker compose down
```

### 6. Service Health Checks

- Database: `pg_isready -h localhost -p 5432`
- Cache: `redis-cli -h localhost -p 6379 ping`
- API: `curl http://localhost:1284/kamehame`

### 7. Enjoy!

Your container should now be available at [http://localhost:3000](http://localhost:3000) or at the domain you set up!

---

## ☁️ Cloudflare Workers Deployment

### Prerequisites

- [Bun](https://bun.sh/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare account with Workers enabled

> For any issues, please refer to the official Cloudflare Workers
> [documentation](https://developers.cloudflare.com/workers/).

### 1. Install Dependencies and Sign In to Wrangler

```bash
bun install
bun wrangler --version
bun wrangler login
```

### 2. Configure Worker

The `wrangler.toml` is already configured to instantly deploy, however you will need to add certain environment
variables for the worker to function fully.

If testing, make sure to add the wrangler.dev url cloudflare provisions for you to the `NEXT_PUBLIC_BACKEND_URL` and
`NEXT_PUBLIC_FRONTEND_URL` environment variables in both the wrangler.toml and .env files.

If deploying to production, make sure to use your production url in the `NEXT_PUBLIC_BACKEND_URL` and
`NEXT_PUBLIC_FRONTEND_URL` environment variables in both the wrangler.toml and .env files.

1. Add the values outlined in the .env.example file to the wrangler.toml file or to your Worker settings on the
   Cloudflare dashboard.
2. Configure your .env file with your production values.
3. Run `bun env:sync` to sync your .env file to the web workspace or the frontend build will fail.
4. Run `cp .env .dev.vars` to copy your .env file to the .dev.vars file for testing it locally before deployment.

> **Note:** The worker front end is build with [opennext](https://opennext.js.org/) and therefore acts exactly as a
> Nextjs build, so env variables are extracted from the .env file at the root of the workspace (`apps/web` in this
> case). Technically, the only variables required for the frontend build are `NEXT_PUBLIC_BACKEND_URL` and
> `NEXT_PUBLIC_FRONTEND_URL`, but it is recommended to sync all variables.

### 3. Deploy Worker

You will need to run this command in the `apps/web` directory and the `apps/server` directory respectively.

```bash
bun run deploy
```

### 4. Set Up Custom Domain (Optional)

Refer to the official [documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
for adding custom domains to your workers

### 5. Environment Variables

Set environment variables in the
[Cloudflare Workers dashboard](https://developers.cloudflare.com/workers/configuration/environment-variables/) or using
Wrangler:

```bash
wrangler secret put API_KEY
wrangler secret put DATABASE_URL
```

> **Note:** `wrangler.toml` is not ignored in the `.gitignore`, so if you add environment variables for your deployment,
> they will be committed to version control. Make sure to remove them before pushing to a public repository.

### 6. Enjoy!

Your worker should now be available at the domain you set up or at the wrangler.dev url cloudflare provisions for you!
