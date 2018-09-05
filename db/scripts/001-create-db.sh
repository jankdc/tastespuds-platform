#!/bin/bash

if [[ -n "$POSTGRES_TEST_DB" ]]; then
  printf "\n\nCreating test database $POSTGRES_TEST_DB...\n\n"

  createdb ${POSTGRES_TEST_DB}
else
  printf "\n\nSkipping creation of test database...\n\n"
fi
