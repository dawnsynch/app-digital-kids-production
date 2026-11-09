#!/usr/bin/env python3
"""Restore a SQLite backup to a new path and verify it; never overwrite files."""

import argparse
import json
import shutil
from pathlib import Path

from sqlite_backup import file_hash, verify_database


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backup", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    backup = args.backup.resolve()
    output = args.output.resolve()
    if not backup.is_file():
        raise SystemExit(f"Backup not found: {backup}")
    if output.exists():
        raise SystemExit(f"Refusing to overwrite restore target: {output}")
    if backup == output:
        raise SystemExit("Restore output must differ from the backup")

    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(backup, output)
    verification = verify_database(output)
    report = {
        "backup": str(backup),
        "restored_database": str(output),
        "backup_sha256": file_hash(backup),
        "restored_sha256": file_hash(output),
        "hashes_match": file_hash(backup) == file_hash(output),
        **verification,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    if not report["hashes_match"]:
        raise SystemExit("Restore hash does not match backup")
    if report["integrity_check"] != ["ok"] or report["foreign_key_violations"]:
        raise SystemExit("Restored database verification failed")


if __name__ == "__main__":
    main()

