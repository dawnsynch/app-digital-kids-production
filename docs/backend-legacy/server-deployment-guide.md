# Server Deployment Guide

## Overview

This project is prepared for Ubuntu deployment with:

- Docker Compose
- Host-level Nginx reverse proxy
- HTTPS via Certbot
- Persistent SQLite storage under `/app/data` inside the backend container

The application keeps the current SQLite-first design. A future PostgreSQL `DATABASE_URL` can be introduced without changing business logic modules.

## Prerequisites

- Ubuntu server with Docker and Docker Compose installed
- Nginx installed on the host
- `sqlite3` installed on the host for backup and restore scripts
- DNS records pointed to the server:
  - `kids.dawnsynch.co.ke`
  - `kids-api.dawnsynch.co.ke`
- A production `.env` file created from `.env.example`

## Required Repository Directories

- `data/`
- `backups/`

Recommended ownership on the server:

```bash
sudo mkdir -p /srv/digital-kids-assistant/{data,backups}
sudo chown -R $USER:$USER /srv/digital-kids-assistant
```

Avoid `chmod 777`.

## Production Environment Variables

Important production values:

```env
APP_ENV=production
DATABASE_URL=sqlite:////app/data/digital_kids.db
API_BASE_URL=http://backend:8000
PUBLIC_API_URL=https://kids-api.dawnsynch.co.ke
ALLOWED_ORIGINS=https://kids.dawnsynch.co.ke
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=replace-with-your-production-openai-key
OPENAI_MODEL=gpt-4.1-mini
MOCK_AI_MODE=false
OPENAI_TIMEOUT_SECONDS=60
MAX_QUESTIONS_PER_REQUEST=10
MAX_ANSWER_LENGTH=2000
MAX_AI_REQUESTS_PER_LEARNER_PER_HOUR=50
TZ=Africa/Nairobi
```

If `MOCK_AI_MODE=true`, the app can run without `OPENAI_API_KEY`.

## Existing SQLite Data Migration

If you already have a local database at:

```text
data/digital_kids_assistant.db
```

copy it into the production data directory before first launch:

```bash
cp data/digital_kids_assistant.db /srv/digital-kids-assistant/data/digital_kids.db
```

Do not delete the old file until the deployed app is verified.

## Build and Start

From the repository root:

```bash
docker compose -f compose.yaml up -d --build
```

Validate the final Compose config:

```bash
docker compose -f compose.yaml config
```

## Database Initialization

This repository does not use Alembic.

Tables are initialized by the FastAPI startup process in:

```text
backend/app/database.py
```

Production startup is therefore:

```bash
docker compose -f compose.yaml up -d --build
```

The backend creates missing tables on startup and applies the existing lightweight SQLite migration logic.

## Health Checks

Backend health endpoint:

```text
GET /health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "digital-kids-learning-api"
}
```

## Nginx Installation

Templates are provided in:

- `deployment/nginx/kids.dawnsynch.co.ke.conf`
- `deployment/nginx/kids-api.dawnsynch.co.ke.conf`

Copy them into your Nginx sites directory, review the domain names if needed, and enable them.

Example:

```bash
sudo cp deployment/nginx/kids.dawnsynch.co.ke.conf /etc/nginx/sites-available/
sudo cp deployment/nginx/kids-api.dawnsynch.co.ke.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/kids.dawnsynch.co.ke.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/kids-api.dawnsynch.co.ke.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Then obtain HTTPS certificates with Certbot.

## Backup and Restore

Create a compressed SQLite backup:

```bash
deployment/scripts/backup-database.sh
```

Restore from a backup:

```bash
deployment/scripts/restore-database.sh backups/<filename>.db.gz
```

Stop containers before restoring:

```bash
docker compose -f compose.yaml down
```

Recommended cron example for nightly backups:

```cron
0 2 * * * cd /srv/digital-kids-assistant && ./deployment/scripts/backup-database.sh >> /var/log/digital-kids-backup.log 2>&1
```

## Deployment Validation

Run:

```bash
deployment/scripts/validate-deployment.sh
```

This checks:

- Docker and Compose availability
- `.env`
- required directories
- Compose validity
- backend and frontend HTTP reachability
- running containers
- database file presence
- minimum disk space

## Remaining Production Enhancements

- Proper rate limiting is still a future enhancement.
- SQLite is retained for first deployment; PostgreSQL is recommended for heavier production load.
- There is still no Alembic migration history.
