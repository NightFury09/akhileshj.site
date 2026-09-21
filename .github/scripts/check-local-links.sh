#!/usr/bin/env bash
# Verifies every locally-referenced asset in the HTML actually exists in the repo.
# Catches the "/resume.pdf returns 404" class of bug before it reaches production.
set -uo pipefail

fail=0
for html in *.html; do
  [ -e "$html" ] || continue
  while IFS= read -r ref; do
    case "$ref" in
      http://*|https://*|//*|mailto:*|tel:*|data:*|\#*|"") continue ;;
    esac
    target="${ref%%\#*}"        # strip fragment
    target="${target%%\?*}"     # strip query
    [ -z "$target" ] && continue
    target="${target#/}"        # leading slash means repo root
    if [ ! -e "$target" ]; then
      echo "::error file=$html::broken local reference -> $ref"
      fail=1
    fi
  done < <(grep -ohE '(src|href)="[^"]*"' "$html" | sed -E 's/^(src|href)="//; s/"$//' | sort -u)
done

if [ "$fail" -eq 0 ]; then
  echo "All local references resolve."
fi
exit "$fail"
