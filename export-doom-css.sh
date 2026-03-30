#!/bin/bash
set -euo pipefail

OUT="${1:-$(pwd)/theme-gallery/live-css}"
THEMES_FILE="${2:-theme-list.txt}"

# Read non-empty lines into array
mapfile -t THEMES < <(grep -v '^[[:space:]]*$' "$THEMES_FILE" || true)
[[ ${#THEMES[@]} -gt 0 ]] || { echo "No themes in $THEMES_FILE"; exit 1; }

mkdir -p "$OUT"

DOOM="${DOOMBIN:-$HOME/.emacs.d/bin/doom}"
if command -v "$DOOM" >/dev/null 2>&1; then
  # Run inside Doom environment
  "$DOOM" run \
    --eval "(load-file \"$(pwd)/generate-doom-css.el\")" \
    --eval "(doom-export-themes-css '(\"${THEMES[@]}\") \"$OUT\")"
else
  # Fallback to plain Emacs (may miss doom-themes on some setups)
  EMACS_BIN="${EMACS:-emacs}"
  "$EMACS_BIN" --batch \
    --eval "(load-file \"$(pwd)/generate-doom-css.el\")" \
    --eval "(doom-export-themes-css '(\"${THEMES[@]}\") \"$OUT\")"
fi

echo "CSS written to $OUT ($(ls -1 \"$OUT\"/*.css 2>/dev/null | wc -l) files)"
