#!/usr/bin/env bash
#
# Creates a read-only role for inspection tools (Postgres MCP, SQL clients).
# Runs once, when the postgres container starts with an empty data volume.
#
set -euo pipefail

: "${POSTGRES_READONLY_USER:?POSTGRES_READONLY_USER is required}"
: "${POSTGRES_READONLY_PASSWORD:?POSTGRES_READONLY_PASSWORD is required}"

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -v ro_user="$POSTGRES_READONLY_USER" \
  -v ro_password="$POSTGRES_READONLY_PASSWORD" \
  -v db="$POSTGRES_DB" \
  -v owner="$POSTGRES_USER" <<-'EOSQL'
	CREATE ROLE :"ro_user" LOGIN PASSWORD :'ro_password';

	-- Even an accidental write is rejected at the transaction level
	ALTER ROLE :"ro_user" SET default_transaction_read_only = on;

	GRANT CONNECT ON DATABASE :"db" TO :"ro_user";
	GRANT USAGE ON SCHEMA public TO :"ro_user";
	GRANT SELECT ON ALL TABLES IN SCHEMA public TO :"ro_user";

	-- Tables created later by the app user (migrations) become readable automatically
	ALTER DEFAULT PRIVILEGES FOR ROLE :"owner" IN SCHEMA public
	  GRANT SELECT ON TABLES TO :"ro_user";
EOSQL
