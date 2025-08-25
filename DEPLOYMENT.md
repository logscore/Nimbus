# 🚀 Deployment Guide

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
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

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
- API: `curl http://localhost:1284/health`

### 7. Enjoy!

Your container should now be available at [http://localhost:3000](http://localhost:3000) or at the domain you set up!
