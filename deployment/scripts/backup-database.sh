#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${DB_PATH:-./data/digital_kids_assistant.db}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [[ ! -f "$DB_PATH" ]]; then
  echo "Database file not found: $DB_PATH" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/digital_kids_assistant-$TIMESTAMP.db"
ARCHIVE_FILE="$BACKUP_FILE.gz"

sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
gzip -f "$BACKUP_FILE"

find "$BACKUP_DIR" -type f -name '*.gz' -mtime +"$RETENTION_DAYS" -delete

echo "Backup created: $ARCHIVE_FILE"
