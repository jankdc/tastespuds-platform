#!/bin/bash

set -e

start=`date +%s`

export PGHOST=$POSTGRES_HOST

apply_prelude() {
  printf "\nApplying prelude commands...\n\n"

  psql -1 -v ON_ERROR_STOP=1 <<-EOSQL
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

  printf "\n\nPrelude commands applied.\n\n"
}

apply_migration() {
  export PGUSER=$1
  export PGPASSWORD=$2
  export PGDATABASE=$3

  echo "Connecting to ${PGHOST}..."
  for i in 1 2 4 8 16 32 64
  do
    if ! psql -w -c '\conninfo' 1>/dev/null; then
      if [ $i == 64 ]; then
        echo "Unable to connect to ${PGHOST}."
        exit 1
      else
        sleep "${i}s"
      fi
    else
      break
    fi
  done

  apply_prelude

  printf "\nApplying migrations to ${PGDATABASE}...\n\n"

  for migration in `ls -v migrations/*.sql`
  do
    VERSION=$(basename $migration)
    VERSION=${VERSION%.sql}
    MIGRATION_CHECK="SELECT 1 FROM tastespuds.vw_version WHERE version = '${VERSION}'"

    if ! psql -tqc "$MIGRATION_CHECK" | egrep . >/dev/null; then
      echo "${VERSION} applying..."

      psql -1 -v ON_ERROR_STOP=1 -f "$migration"

      echo "${VERSION} applied."
    else
      echo "${VERSION} already applied, skipping..."
    fi
  done

  printf "\nMigrations applied.\n"
  printf "\nMigrated in $((`date +%s` - $start))s\n\n"
}

apply_migration \
  $POSTGRES_USER \
  $POSTGRES_PASSWORD \
  $POSTGRES_DB

if [[ -n "$POSTGRES_TEST_DB" ]]; then
  apply_migration \
    $POSTGRES_USER \
    $POSTGRES_PASSWORD \
    $POSTGRES_TEST_DB
else
  printf "\nSkipping test database migration.\n"
fi
