#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-.}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/compose.yaml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"
DB_PATH="${DB_PATH:-$ROOT_DIR/data/digital_kids_assistant.db}"

command -v docker >/dev/null 2>&1 || { echo "Docker is not installed" >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "Docker Compose is not available" >&2; exit 1; }
[[ -f "$ENV_FILE" ]] || { echo ".env file not found: $ENV_FILE" >&2; exit 1; }
[[ -d "$ROOT_DIR/data" ]] || { echo "Data directory missing: $ROOT_DIR/data" >&2; exit 1; }
[[ -d "$ROOT_DIR/backups" ]] || { echo "Backups directory missing: $ROOT_DIR/backups" >&2; exit 1; }

docker compose -f "$COMPOSE_FILE" config >/dev/null

docker compose -f "$COMPOSE_FILE" ps --services --filter status=running | grep -qx "backend"
docker compose -f "$COMPOSE_FILE" ps --services --filter status=running | grep -qx "frontend"

python - <<'PY'
import urllib.request
for url in ("http://127.0.0.1:8002/health", "http://127.0.0.1:8502"):
    with urllib.request.urlopen(url, timeout=10) as response:
        if response.status != 200:
            raise SystemExit(f"Endpoint not healthy: {url}")
PY

[[ -f "$DB_PATH" ]] || { echo "Database file not found: $DB_PATH" >&2; exit 1; }

AVAILABLE_KB="$(df -k . | awk 'NR==2 {print $4}')"
if [[ "$AVAILABLE_KB" -lt 1048576 ]]; then
  echo "Less than 1GB disk space available" >&2
  exit 1
fi

echo "Deployment validation passed"
