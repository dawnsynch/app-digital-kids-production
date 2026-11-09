# SQLite backup and restore verification

## Active storage

- Application database: `data/digital_kids_assistant.db`.
- SQLAlchemy URL: `sqlite:///./data/digital_kids_assistant.db` locally; `sqlite:////app/data/digital_kids_assistant.db` in Docker.
- Docker storage: bind mount `./data:/app/data`, not a named database volume.
- Journal mode: WAL.
- Companion files observed: `digital_kids_assistant.db-wal` and `digital_kids_assistant.db-shm`.

No command in this exercise deletes, replaces, migrates, or resets the active database.

## Verified procedure

Create a consistent online backup:

```bash
python3 scripts/sqlite_backup.py \
  --source data/digital_kids_assistant.db \
  --output /safe/backup/location/digital-kids-YYYYMMDD-HHMMSS.db
```

The utility:

1. refuses an existing output path;
2. opens the source in SQLite read-only mode;
3. uses SQLite's online backup API, which includes committed WAL content consistently;
4. verifies the isolated backup with `PRAGMA integrity_check` and `PRAGMA foreign_key_check`;
5. reports table counts and SHA-256 hashes;
6. fails if the durable source database or WAL hash changes.

Restore only to a new isolated path:

```bash
python3 scripts/sqlite_restore_verify.py \
  --backup /safe/backup/location/digital-kids-YYYYMMDD-HHMMSS.db \
  --output /isolated/restore/digital-kids-restored.db
```

The restore tool refuses overwrite, copies the backup, compares hashes, and reruns integrity, foreign-key, journal, and record-count checks.

## Phase 0B evidence

| Check | Result |
| --- | --- |
| Active database SHA-256 before/after | `496560a31490ef473135b57d55fa6f9be2ae013d6092aae9d9a4ac6bffc22e8c`, unchanged |
| Active WAL SHA-256 before/after | Empty-file SHA-256, unchanged |
| Backup SHA-256 | `fe933eed58793f85ce2b798f41550ad5ade7c73a560ec2025a3e369dcc373e1f` |
| Restored SHA-256 | Same as backup |
| Backup/restore integrity | `ok` |
| Foreign-key violations | 0 |
| Journal mode | WAL |
| Users | 29 |
| Students | 13 |
| Assessment attempts | 16 |
| Learning interactions | 11 |
| FastAPI opened restored DB | PASS; `/health` returned 200 and `healthy` |

SQLite may update lock bytes in the transient `-shm` file when a connection opens; that file is not a durable backup artifact. The main database and WAL are the enforced immutability boundary, and both remained unchanged during the successful verified run.

## Production recovery runbook

1. Confirm adequate free space and choose a backup location outside the application bind mount.
2. Run the online backup and retain its JSON verification output with the deployment record.
3. Copy the verified backup off-host using approved encrypted storage.
4. Rehearse restoration to a new file and compare counts before every deployment switch.
5. For an actual replacement, stop all API/Streamlit writers, take a final backup, and obtain explicit operational approval before changing `DATABASE_URL` or the active file.
6. Start against the restored path, check `/health`, authentication, learner access, and a read-only progress request before reopening writes.
7. Keep the previous active database and WAL untouched throughout the rollback window.

