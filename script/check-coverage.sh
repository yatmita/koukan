#!/usr/bin/env bash
# Coverage gate for ralph-loop.
# Pass iff every line in `src/` has at least 80% line coverage from `forge coverage`.
# Excludes test/ and lib/.

set -euo pipefail

# Foundry binaries are installed under ~/.foundry/bin and not in /bin/sh's default PATH.
export PATH="${HOME}/.foundry/bin:${PATH}"

THRESHOLD="${COVERAGE_THRESHOLD:-80}"

cd "$(dirname "$0")/.."

RAW="$(forge coverage --report summary --no-match-coverage 'test/|lib/' 2>&1 || true)"

echo "$RAW"

FAIL=0
while IFS= read -r line; do
    case "$line" in
        *"| src/"*)
            lines_pct="$(echo "$line" | awk -F'|' '{print $3}' | tr -d ' %' | awk '{print $1}')"
            num="$(echo "$lines_pct" | sed -E 's/[^0-9.].*//')"
            if [ -z "$num" ]; then
                continue
            fi
            below="$(awk -v a="$num" -v b="$THRESHOLD" 'BEGIN{ print (a+0 < b+0) ? "1" : "0" }')"
            file="$(echo "$line" | awk -F'|' '{print $2}' | sed 's/^ *//;s/ *$//')"
            if [ "$below" = "1" ]; then
                echo "FAIL: $file line coverage ${num}% < ${THRESHOLD}%"
                FAIL=1
            else
                echo "OK:   $file line coverage ${num}%"
            fi
            ;;
    esac
done <<< "$RAW"

if [ "$FAIL" -ne 0 ]; then
    echo "Coverage gate failed (threshold=${THRESHOLD}%)."
    exit 1
fi

echo "Coverage gate passed (threshold=${THRESHOLD}%)."
