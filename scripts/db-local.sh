#!/usr/bin/env bash
# Starts a throwaway Postgres for development inside .data/pg (no system service, no Docker).
# Usage: scripts/db-local.sh start|stop|status
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/.data/pg"
PORT="${PGPORT_LOCAL:-54329}"
case "${1:-start}" in
  start)
    if [ ! -f "$DIR/PG_VERSION" ]; then
      mkdir -p "$DIR"
      initdb -D "$DIR" -U petal --auth=trust >/dev/null
    fi
    pg_ctl -D "$DIR" -o "-p $PORT -k /tmp -c listen_addresses=localhost" -l "$DIR/server.log" -w start
    createdb -h localhost -p "$PORT" -U petal petal 2>/dev/null || true
    echo "DATABASE_URL=postgres://petal@localhost:$PORT/petal"
    ;;
  stop) pg_ctl -D "$DIR" -w stop ;;
  status) pg_ctl -D "$DIR" status ;;
  *) echo "usage: $0 start|stop|status"; exit 1 ;;
esac
