# PostgreSQL migration milestone (deferred)

SQLite is the active Phase 1 datastore. PostgreSQL migration is a later milestone and no database engine, schema, or data was changed during consolidation.

## Proposed milestone

1. Inventory production SQLite files, WAL state, row counts, foreign keys, and backup/restore rehearsal.
2. Introduce Alembic and capture the current SQLAlchemy schema as a reviewed baseline migration.
3. Add a PostgreSQL driver and a PostgreSQL service only in a separate test Compose profile.
4. Test schema creation and application behavior against both SQLite and PostgreSQL.
5. Build a one-time, idempotent export/import tool with source and destination row-count checks.
6. Run authorization, revision, learning, progress, and concurrency tests against PostgreSQL.
7. Schedule a backed-up cutover with a rollback window; retain the original SQLite database read-only until acceptance.

## Exit criteria

- Restorable backups proven for both source and destination.
- Migration is repeatable in staging with matching row counts and relationship checks.
- No role-scope or assessment-history regression.
- Production `DATABASE_URL` secret and TLS configuration are documented.
- Rollback and observation periods are approved.

