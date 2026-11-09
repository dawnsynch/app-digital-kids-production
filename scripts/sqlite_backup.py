#!/usr/bin/env python3
"""Create and verify a consistent SQLite backup without altering the source."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


def file_hash(path: Path) -> str | None:
    if not path.exists():
        return None
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def source_hashes(path: Path) -> dict[str, str | None]:
    return {suffix or "database": file_hash(Path(f"{path}{suffix}")) for suffix in ("", "-wal", "-shm")}


def quote_identifier(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def verify_database(path: Path) -> dict:
    # Verification targets are isolated backup/restore files. A writable
    # connection lets SQLite create transient WAL shared-memory state.
    connection = sqlite3.connect(path)
    try:
        integrity = connection.execute("PRAGMA integrity_check").fetchall()
        foreign_keys = connection.execute("PRAGMA foreign_key_check").fetchall()
        journal_mode = connection.execute("PRAGMA journal_mode").fetchone()[0]
        tables = [
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
            )
        ]
        counts = {
            table: connection.execute(f"SELECT COUNT(*) FROM {quote_identifier(table)}").fetchone()[0]
            for table in tables
        }
    finally:
        connection.close()
    return {
        "integrity_check": [row[0] for row in integrity],
        "foreign_key_violations": len(foreign_keys),
        "journal_mode": journal_mode,
        "table_counts": counts,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path("data/digital_kids_assistant.db"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    source = args.source.resolve()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    output = (args.output or Path("backups") / f"digital-kids-{timestamp}.db").resolve()
    if not source.is_file():
        raise SystemExit(f"Source database not found: {source}")
    if output.exists():
        raise SystemExit(f"Refusing to overwrite existing backup: {output}")
    if source == output:
        raise SystemExit("Backup output must differ from the source database")

    before = source_hashes(source)
    output.parent.mkdir(parents=True, exist_ok=True)
    source_connection = sqlite3.connect(f"file:{source}?mode=ro", uri=True)
    destination_connection = sqlite3.connect(output)
    try:
        source_connection.backup(destination_connection)
    finally:
        destination_connection.close()
        source_connection.close()
    after = source_hashes(source)
    durable_files_unchanged = all(before[key] == after[key] for key in ("database", "-wal"))

    report = {
        "source": str(source),
        "backup": str(output),
        "source_database_and_wal_unchanged": durable_files_unchanged,
        "source_shm_changed": before["-shm"] != after["-shm"],
        "source_hashes": after,
        "backup_sha256": file_hash(output),
        "backup_size_bytes": output.stat().st_size,
        **verify_database(output),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    if not durable_files_unchanged:
        raise SystemExit("Source database or WAL changed during backup")
    if report["integrity_check"] != ["ok"] or report["foreign_key_violations"]:
        raise SystemExit("Backup verification failed")


if __name__ == "__main__":
    main()

