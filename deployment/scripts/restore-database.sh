#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${DB_PATH:-./data/digital_kids_assistant.db}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup-file.gz>" >&2
  exit 1
fi

BACKUP_FILE="$1"
if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

echo "Stop the application containers before restoring the database."

mkdir -p "$BACKUP_DIR"
PRE_RESTORE_COPY="$BACKUP_DIR/pre-restore-$(date +%Y%m%d-%H%M%S).db"

if [[ -f "$DB_PATH" ]]; then
  cp "$DB_PATH" "$PRE_RESTORE_COPY"
fi

TMP_DB="$(mktemp)"
gzip -dc "$BACKUP_FILE" > "$TMP_DB"
sqlite3 "$TMP_DB" "PRAGMA integrity_check;" | grep -qx "ok"

mv "$TMP_DB" "$DB_PATH"
echo "Database restored to: $DB_PATH"
echo "Pre-restore copy: $PRE_RESTORE_COPY"
