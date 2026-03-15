fix_supabase_migrations.sh

Purpose

A helper script to diagnose and (optionally) resolve a migration conflict where a migration version is recorded in `schema_migrations` but the corresponding schema change (e.g., `events.deleted_at`) is missing.

Prerequisites

- `psql` installed and accessible on PATH.
- `supabase` CLI installed (optional, but the script will call it to run `supabase db push`).
- Set `DATABASE_URL` environment variable to point to your Postgres DB (the same DB Supabase uses).

Usage

Interactive (recommended):

```bash
DATABASE_URL="postgres://user:pass@host:5432/dbname" ./scripts/fix_supabase_migrations.sh
```

Non-interactive (auto-apply deletion + push):

```bash
DATABASE_URL="postgres://user:pass@host:5432/dbname" ./scripts/fix_supabase_migrations.sh --yes
```

What the script does

1. Checks whether `events.deleted_at` column exists.
2. Lists `schema_migrations` entries.
3. If the conflicting migration is present but `deleted_at` is missing, prompts to delete the migration row from `schema_migrations`.
4. If you confirm (or use `--yes`), deletes that row and runs `supabase db push` to reapply migrations.

If the script cannot make changes (e.g., no `supabase` CLI), it will print guidance and SQL to run manually.

Notes and safety

- Modifying `schema_migrations` is potentially dangerous; prefer running this on a staging DB first.
- Always backup your DB before making changes in production.
