#!/usr/bin/env bash

set -e

start=`date +%s`

connect_to_db() {
  echo "Connecting to '${DB_URL}'..."
  for i in 1 2 4 8 16 32 64
  do
    if ! psql -w -c '\conninfo' "${DB_URL}" 1>/dev/null; then
      if [ $i == 64 ]; then
        echo "Unable to connect to '${DB_URL}'."
        exit 1
      else
        sleep "${i}s"
      fi
    else
      break
    fi
  done
}

apply_prelude() {
  printf "Applying prelude commands...\n\n"
  psql -1 -v ON_ERROR_STOP=1 "${DB_URL}" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS tastespuds;

    CREATE TABLE IF NOT EXISTS tastespuds.db_version (
      id SERIAL PRIMARY KEY NOT NULL,
      version INTEGER[3] NOT NULL UNIQUE,
      executed_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    COMMENT ON TABLE tastespuds.db_version IS 'A record of migrations run against the db';

    CREATE OR REPLACE VIEW tastespuds.vw_version AS
      SELECT
        id,
        concat('v', array_to_string(version, '.')) AS version,
        executed_on
      FROM
        tastespuds.db_version;
EOSQL

  printf "Prelude commands applied.\n\n"
}

apply_migration() {
  export DB_URL=$1

  connect_to_db
  apply_prelude

  printf "Applying migrations...\n\n"
  for migration in `ls -v migrations/*.sql`
  do
    VERSION=$(basename $migration)
    VERSION=${VERSION%.sql}
    MIGRATION_CHECK="SELECT 1 FROM tastespuds.vw_version WHERE version = '${VERSION}'"

    if ! psql -tqc "$MIGRATION_CHECK" "${DB_URL}" | egrep . >/dev/null; then
      echo "${VERSION} applying..."

      psql -1 -v ON_ERROR_STOP=1 -f "$migration" "${DB_URL}"

      echo "${VERSION} applied."
    else
      echo "${VERSION} already applied, skipping..."
    fi
  done

  printf "Migrations applied.\n"
  printf "Migrated in $((`date +%s` - $start))s\n\n"
}

apply_migration $DATABASE_URL

if [[ -n "$DATABASE_TEST_URL" ]]; then
  apply_migration $DATABASE_TEST_URL
else
  printf "Skipping test database migration.\n"
fi

printf "Migration complete.\n"
