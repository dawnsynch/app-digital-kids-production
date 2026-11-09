# Deployment Guide

This project should now be deployed as two separate units:

1. `app stack`
   - FastAPI backend
   - Streamlit app
2. `marketing site`
   - static landing page only

That separation is the correct production model if you want to host the landing page from a different folder or a different server.

## Runtime Architecture

Recommended domains:

- `https://kids.example.com` -> marketing site
- `https://app.kids.example.com` -> Streamlit app
- `https://api.kids.example.com` -> FastAPI API

Flow:

1. A user lands on `kids.example.com`.
2. CTA buttons point to `app.kids.example.com`.
3. The Streamlit app talks to the FastAPI container over Docker network using `http://api:8000`.
4. SQLite data is persisted on the app server through the mounted `./data` directory.

Important:

- Inside Docker, the Streamlit app must use `API_BASE_URL=http://api:8000`.
- Do not point the Streamlit container to `localhost`.
- The marketing site does not need access to the backend.

## Deployment Files

### App stack files

Use these from the repository root:

- [Dockerfile.api](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/Dockerfile.api)
- [Dockerfile.ui](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/Dockerfile.ui)
- [docker-compose.prod.yml](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/docker-compose.prod.yml)
- [docker-compose.server-build.yml](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/docker-compose.server-build.yml)
- [.github/workflows/deploy.yml](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/.github/workflows/deploy.yml)

### Marketing site files

For a standalone landing-page repository, these files should live at that repository root:

- `Dockerfile`
- `docker-compose.prod.yml`
- `docker-compose.server-build.yml`
- `.github/workflows/deploy-marketing.yml`
- `index.html`
- `styles.css`
- `assets/`

## App Stack Deployment

### App stack production compose

[docker-compose.prod.yml](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/docker-compose.prod.yml)

```yaml
services:
  api:
    image: ${API_IMAGE}
    container_name: dka-api
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data:/app/data
    ports:
      - "8000:8000"

  ui:
    image: ${UI_IMAGE}
    container_name: dka-ui
    restart: unless-stopped
    env_file:
      - .env
    environment:
      API_BASE_URL: http://api:8000
    depends_on:
      - api
    ports:
      - "8501:8501"
```

### App stack build-on-server compose

[docker-compose.server-build.yml](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/docker-compose.server-build.yml)

Use this when the server builds images locally from the repo checkout.

### App stack environment

Create `.env` on the app server:

```env
APP_ENV=production
TZ=Africa/Nairobi

DATABASE_URL=sqlite:////app/data/digital_kids_assistant.db

JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

OPENAI_API_KEY=replace-with-real-openai-key
OPENAI_MODEL=gpt-4.1-mini
MOCK_AI_MODE=false
OPENAI_TIMEOUT_SECONDS=60
OPENAI_RETRY_COUNT=2

PUBLIC_API_URL=https://api.kids.example.com
API_BASE_URL=https://api.kids.example.com
ALLOWED_ORIGINS=https://app.kids.example.com,https://kids.example.com

MAX_QUESTIONS_PER_REQUEST=10
MAX_ANSWER_LENGTH=2000
MAX_AI_REQUESTS_PER_LEARNER_PER_HOUR=50
```

### Manual app stack deployment

Build on server:

```bash
cd /opt/digital-kids-assistant-phase1
docker compose -f docker-compose.server-build.yml build
docker compose -f docker-compose.server-build.yml up -d
```

Pull prebuilt images:

```bash
cd /opt/digital-kids-assistant-phase1
export API_IMAGE=ghcr.io/your-org/digital-kids-assistant-phase1-api:sha-<commit-sha>
export UI_IMAGE=ghcr.io/your-org/digital-kids-assistant-phase1-ui:sha-<commit-sha>
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Check:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f ui
curl http://127.0.0.1:8000/health
curl -I http://127.0.0.1:8501
```

## Marketing Site Deployment

The marketing site is self-contained now. You can copy it into a separate repository and deploy it independently from that repository root.

### Marketing site production compose

Standalone repository root `docker-compose.prod.yml`

```yaml
services:
  marketing:
    image: ${MARKETING_IMAGE}
    container_name: dka-marketing
    restart: unless-stopped
    ports:
      - "8080:80"
```

### Marketing site build-on-server compose

Standalone repository root `docker-compose.server-build.yml`

```yaml
services:
  marketing:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dka-marketing
    restart: unless-stopped
    ports:
      - "8080:80"
```

### Marketing folder layouts

If you copy the marketing site into its own folder on a server, use one of these layouts.

Image-based deployment:

```text
/opt/dka-marketing/
  docker-compose.prod.yml
```

Build-on-server deployment:

```text
/opt/dka-marketing/
  Dockerfile
  docker-compose.server-build.yml
  index.html
  styles.css
  assets/
```

### Manual marketing deployment

Build on marketing server:

```bash
cd /opt/dka-marketing
docker compose -f docker-compose.server-build.yml build
docker compose -f docker-compose.server-build.yml up -d
```

Pull prebuilt image:

```bash
cd /opt/dka-marketing
export MARKETING_IMAGE=ghcr.io/your-org/digital-kids-assistant-phase1-marketing:latest
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Check:

```bash
cd /opt/dka-marketing
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f marketing
curl -I http://127.0.0.1:8080
```

## GitHub Actions

There are now two independent workflows.

### 1. App stack workflow

File: [.github/workflows/deploy.yml](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/.github/workflows/deploy.yml)

Purpose:

- build and push `api` and `ui` images
- deploy only the app stack

Trigger scope:

- `backend/**`
- `frontend/**`
- app Docker files
- app compose files
- app workflow file

Required GitHub secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- `GHCR_USERNAME`
- `GHCR_TOKEN`

Remote expectation:

```text
${DEPLOY_PATH}/
  .env
  docker-compose.prod.yml
  data/
```

### 2. Marketing workflow

File in the standalone landing-page repository: `.github/workflows/deploy-marketing.yml`

Purpose:

- build and push only the marketing image
- deploy only the marketing site

Trigger scope in the standalone landing-page repository:

- `index.html`
- `styles.css`
- `assets/**`
- `Dockerfile`
- `docker-compose.prod.yml`
- `docker-compose.server-build.yml`
- marketing workflow file

Required GitHub secrets:

- `MARKETING_DEPLOY_HOST`
- `MARKETING_DEPLOY_USER`
- `MARKETING_DEPLOY_SSH_KEY`
- `MARKETING_DEPLOY_PATH`
- `GHCR_USERNAME`
- `GHCR_TOKEN`

Remote expectation:

```text
${MARKETING_DEPLOY_PATH}/
  docker-compose.prod.yml
```

### GitHub Actions behavior

App changes do not redeploy marketing.

Marketing changes do not redeploy the app stack.

That is the separation you want if the landing page is maintained in a different folder or hosted independently.

## How The Solution Runs After Separation

### Public flow

1. User visits `kids.example.com`
2. Marketing CTAs send the user to `app.kids.example.com`
3. User logs in or signs up on the Streamlit app

### Internal app flow

1. Streamlit receives authenticated user actions
2. Streamlit sends requests to `http://api:8000` across the Docker network
3. FastAPI handles auth, learners, revision, marking, progress, hobbies, coding, spiritual lessons, and admin
4. SQLite persists in the mounted app stack `data/` directory

### Marketing flow

1. Nginx serves static files only
2. No backend connection is required
3. All CTA links should continue pointing to the deployed Streamlit app URL

## Reverse Proxy Guidance

Recommended routing:

- `kids.example.com` -> marketing site container
- `app.kids.example.com` -> Streamlit container
- `api.kids.example.com` -> FastAPI container

If using host-level Nginx, proxy to:

- `127.0.0.1:8080` -> marketing
- `127.0.0.1:8501` -> Streamlit
- `127.0.0.1:8000` -> API

Terminate TLS at the reverse proxy.

## Operational Notes

- SQLite is fine only for a single-server MVP.
- Do not run multiple API replicas against the same SQLite database file.
- Back up the `data/` directory regularly.
- Keep secrets on the servers, not in Git.
- Production should use `MOCK_AI_MODE=false` if OpenAI output is required.
- If learner revision returns generic fallback questions, check `/health` and confirm `ai_mode` is `openai`.

## Recommended Next Improvements

1. Add repo-managed Nginx or Caddy reverse proxy configs.
2. Add healthchecks to Docker Compose services.
3. Add SQLite backup automation.
4. Move to PostgreSQL before scaling beyond a single-host pilot.
5. Add staging workflows separate from production.
