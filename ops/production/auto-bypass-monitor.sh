#!/usr/bin/env bash

set -u

ASSETS_DIR="/var/www/gestion_tareas/assets"
PROCESS_SCRIPT="/opt/tldraw-bypass/apply-tldraw-bypass.sh"
STATE_DIR="/var/lib/tldraw-bypass"
STATE_FILE="${STATE_DIR}/processed-board-chunk"
LOG_FILE="/var/log/tldraw-bypass.log"

BOARD_CHUNK="$(
  find "$ASSETS_DIR" -maxdepth 1 -type f -name 'BoardPage-*.js' \
    -printf '%T@ %p\n' 2>/dev/null \
    | sort -rn \
    | head -n 1 \
    | cut -d' ' -f2-
)"

if [[ -z "$BOARD_CHUNK" ]]; then
  printf '%s [ERROR] No se encontro chunk BoardPage\n' "$(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
  exit 1
fi

CHUNK_NAME="$(basename "$BOARD_CHUNK")"
LAST_PROCESSED="$(cat "$STATE_FILE" 2>/dev/null || true)"

if [[ "$LAST_PROCESSED" == "$CHUNK_NAME" ]]; then
  exit 0
fi

mkdir -p "$STATE_DIR"
printf '%s [INFO] Procesando chunk nuevo: %s\n' \
  "$(date '+%Y-%m-%d %H:%M:%S')" "$CHUNK_NAME" >> "$LOG_FILE"

if bash "$PROCESS_SCRIPT" >> "$LOG_FILE" 2>&1; then
  printf '%s [OK] Chunk procesado: %s\n' \
    "$(date '+%Y-%m-%d %H:%M:%S')" "$CHUNK_NAME" >> "$LOG_FILE"
  RESULT=0
else
  printf '%s [ERROR] Fallo al procesar chunk: %s\n' \
    "$(date '+%Y-%m-%d %H:%M:%S')" "$CHUNK_NAME" >> "$LOG_FILE"
  RESULT=1
fi

printf '%s\n' "$CHUNK_NAME" > "${STATE_FILE}.tmp"
mv "${STATE_FILE}.tmp" "$STATE_FILE"

exit "$RESULT"

