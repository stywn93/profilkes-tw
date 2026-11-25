#!/usr/bin/env bash
set -euo pipefail

seed_file() {
  docker compose exec -T mysql sh -c \
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot "$MYSQL_DATABASE"' \
    < "$1"
}

seed_file database/population_age_groups.sql
seed_file database/population_literacy_education.sql

echo "Database seed selesai."
