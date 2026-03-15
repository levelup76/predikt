#!/usr/bin/env bash
set -euo pipefail

# fix_supabase_migrations.sh
# Safe helper to diagnose and resolve duplicate schema_migrations conflicts
# Usage:
#   DATABASE_URL="postgres://..." ./scripts/fix_supabase_migrations.sh    # interactive
#   DATABASE_URL="postgres://..." ./scripts/fix_supabase_migrations.sh --yes  # non-interactive (auto-apply)

AUTO_NO_PROMPT=0
if [ "${1:-}" = "--yes" ] || [ "${AUTO:-}" = "yes" ]; then
  AUTO_NO_PROMPT=1
fi

if ! command -v psql &>/dev/null; then
  echo "psql is required. Install it and ensure it's on PATH." >&2
  exit 2
fi

if ! command -v supabase &>/dev/null; then
  echo "supabase CLI not found. Install from https://supabase.com/docs/guides/cli and ensure it's on PATH." >&2
  # Not fatal; we can still show SQL to run manually.
fi

: "${DATABASE_URL:?Please set DATABASE_URL environment variable to your Postgres connection string.}")

PSQL="psql $DATABASE_URL -v ON_ERROR_STOP=1 -q -t -A"

echo "Checking events.deleted_at column..."
col=$($PSQL -c "SELECT column_name FROM information_schema.columns WHERE table_name='events' AND column_name='deleted_at';") || true

if [ -n "$col" ]; then
  echo "Column 'events.deleted_at' already exists. No action needed." 
  exit 0
fi

echo "Column 'deleted_at' NOT found on table 'events'. Inspecting schema_migrations..."
$PSQL -c "SELECT version, installed_at FROM schema_migrations ORDER BY version;"

# Check for specific migration versions referenced by repo
CONFLICT_VERSION_1="20260201"
CONFLICT_VERSION_2="20260315"

has_v1=$($PSQL -c "SELECT 1 FROM schema_migrations WHERE version='${CONFLICT_VERSION_1}' LIMIT 1;" || true)
has_v2=$($PSQL -c "SELECT 1 FROM schema_migrations WHERE version='${CONFLICT_VERSION_2}' LIMIT 1;" || true)

echo "Found migration ${CONFLICT_VERSION_1}: ${has_v1:+yes}${has_v1:-(no)}"
echo "Found migration ${CONFLICT_VERSION_2}: ${has_v2:+yes}${has_v2:-(no)}"

if [ -z "$has_v1" ] && [ -z "$has_v2" ]; then
  echo "No suspicious migration entries found. You can try running:"
  echo "  supabase db push"
  exit 1
fi

# If v1 exists but column missing, it's likely the recorded migration wasn't applied or partially applied.
if [ -n "$has_v1" ] && [ -z "$col" ]; then
  echo "Migration ${CONFLICT_VERSION_1} is recorded but 'deleted_at' column is missing."
  if [ "$AUTO_NO_PROMPT" -eq 0 ]; then
    read -p "Do you want to DELETE the schema_migrations entry ${CONFLICT_VERSION_1} so Supabase can reapply it? (y/N) " yn
    case "$yn" in
      [Yy]* ) DO_DELETE=1 ;;
      * ) DO_DELETE=0 ;;
    esac
  else
    DO_DELETE=1
  fi

  if [ "$DO_DELETE" -eq 1 ]; then
    echo "Deleting schema_migrations entry ${CONFLICT_VERSION_1}..."
    $PSQL -c "DELETE FROM schema_migrations WHERE version='${CONFLICT_VERSION_1}';"
    echo "Deleted. Current schema_migrations:"
    $PSQL -c "SELECT version, installed_at FROM schema_migrations ORDER BY version;"

    if command -v supabase &>/dev/null; then
      echo "Running 'supabase db push' to apply pending migrations..."
      supabase db push
    else
      echo "supabase CLI not found. Re-run with supabase CLI available to apply migrations."
      echo "Alternatively, run the SQL migration file located at supabase/migrations/${CONFLICT_VERSION_2}_event_soft_delete_audit.sql manually against the DB."
    fi
  else
    echo "Skipping deletion. No automatic change made."
  fi
fi

# Re-check column
col2=$($PSQL -c "SELECT column_name FROM information_schema.columns WHERE table_name='events' AND column_name='deleted_at';" || true)
if [ -n "$col2" ]; then
  echo "Success: 'events.deleted_at' now exists."
  exit 0
fi

echo "After attempted fixes, 'events.deleted_at' is still missing." >&2
echo "Next steps:"
echo " - Inspect the migration files in supabase/migrations/ and the schema_migrations table manually."
echo " - If safe, consider applying the SQL from supabase/migrations/20260315_event_soft_delete_audit.sql manually via psql."

exit 1
