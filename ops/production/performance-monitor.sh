#!/usr/bin/env bash

set -u

END_FILE="/var/lib/gestion-tareas-performance/end-epoch"
LOG_FILE="/var/log/gestion-tareas-performance.log"
SERVICE="gestion-tareas-backend"

if [[ ! -s "$END_FILE" ]]; then
  printf '%s [ERROR] No existe fecha de fin del monitoreo\n' "$(date --iso-8601=seconds)" >> "$LOG_FILE"
  exit 1
fi

NOW="$(date +%s)"
END_EPOCH="$(cat "$END_FILE")"

if (( NOW >= END_EPOCH )); then
  printf '%s [INFO] Monitoreo de 24 horas finalizado\n' "$(date --iso-8601=seconds)" >> "$LOG_FILE"
  systemctl disable --now gestion-tareas-performance.timer >/dev/null 2>&1 || true
  exit 0
fi

PID="$(systemctl show -p MainPID --value "$SERVICE")"
RSS_KB="$(ps -o rss= -p "$PID" 2>/dev/null | tr -d ' ' || true)"
CPU_PERCENT="$(ps -o %cpu= -p "$PID" 2>/dev/null | tr -d ' ' || true)"
DISK_USED_BYTES="$(df -B1 / | awk 'NR == 2 { print $3 }')"
DISK_AVAILABLE_BYTES="$(df -B1 / | awk 'NR == 2 { print $4 }')"
HEALTH_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:4100/health || true)"
RECENT_LOGS="$(journalctl -u "$SERVICE" --since '6 minutes ago' --no-pager 2>/dev/null || true)"
PATCH_COUNT="$(grep -c 'PATCH /api/pages/' <<< "$RECENT_LOGS" || true)"
PATCH_ERRORS="$(grep 'PATCH /api/pages/' <<< "$RECENT_LOGS" | grep -Ec ' (4|5)[0-9]{2} ' || true)"
LAST_PATCH_MS="$(
  grep 'PATCH /api/pages/' <<< "$RECENT_LOGS" \
    | sed -nE 's/.* ([0-9]+([.][0-9]+)?) ms$/\1/p' \
    | tail -n 1
)"

printf '%s health=%s rss_kb=%s cpu_percent=%s disk_used_bytes=%s disk_available_bytes=%s page_patches_6m=%s page_patch_errors_6m=%s last_page_patch_ms=%s\n' \
  "$(date --iso-8601=seconds)" \
  "${HEALTH_STATUS:-unknown}" \
  "${RSS_KB:-unknown}" \
  "${CPU_PERCENT:-unknown}" \
  "$DISK_USED_BYTES" \
  "$DISK_AVAILABLE_BYTES" \
  "$PATCH_COUNT" \
  "$PATCH_ERRORS" \
  "${LAST_PATCH_MS:-none}" \
  >> "$LOG_FILE"

