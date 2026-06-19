#!/usr/bin/env bash

set -euo pipefail

prune_directories() {
  local root="$1"
  local pattern="$2"
  local keep="$3"
  local prefix="$4"
  local index=0

  while IFS= read -r path; do
    [[ -n "$path" ]] || continue
    index=$((index + 1))
    if (( index <= keep )); then
      continue
    fi

    case "$path" in
      "$prefix"*) rm -rf -- "$path" ;;
      *) printf 'Ruta rechazada por seguridad: %s\n' "$path" >&2; exit 1 ;;
    esac
  done < <(
    find "$root" -mindepth 1 -maxdepth 1 -type d -name "$pattern" \
      -printf '%T@ %p\n' 2>/dev/null \
      | sort -rn \
      | cut -d' ' -f2-
  )
}

prune_files() {
  local root="$1"
  local pattern="$2"
  local keep="$3"
  local prefix="$4"
  local index=0

  while IFS= read -r path; do
    [[ -n "$path" ]] || continue
    index=$((index + 1))
    if (( index <= keep )); then
      continue
    fi

    case "$path" in
      "$prefix"*) rm -f -- "$path" ;;
      *) printf 'Ruta rechazada por seguridad: %s\n' "$path" >&2; exit 1 ;;
    esac
  done < <(
    find "$root" -mindepth 1 -maxdepth 1 -type f -name "$pattern" \
      -printf '%T@ %p\n' 2>/dev/null \
      | sort -rn \
      | cut -d' ' -f2-
  )
}

# Actual + release anterior.
prune_directories "/opt/gestion_tareas/releases" "*" 2 "/opt/gestion_tareas/releases/"

# La instalacion actual vive fuera de estas rutas; se conserva un rollback inmediato.
prune_directories "/var/www" "gestion_tareas_backup_*" 1 "/var/www/gestion_tareas_backup_"
prune_directories "/opt/gestion_tareas" "backend_backup_*" 1 "/opt/gestion_tareas/backend_backup_"

# Respaldos operativos de PostgreSQL.
prune_files "/opt/backups/gestion_tareas" "*.dump" 3 "/opt/backups/gestion_tareas/"

