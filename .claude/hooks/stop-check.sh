#!/usr/bin/env bash
# Stop hook: run the repo check before Claude can finish a turn.
# Exit 2 sends the failure output back to Claude so it keeps working; exit 0 lets it stop.
set -uo pipefail

input=$(cat)

# Already continuing because of a previous block: don't loop forever.
if grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true' <<<"$input"; then
	exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# Nothing changed (pure Q&A turn): skip the check.
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
	exit 0
fi

output=$(bun run check 2>&1)
status=$?

if [ "$status" -ne 0 ]; then
	{
		echo "bun run check failed. Fix the problems below, then finish."
		echo "----"
		tail -n 50 <<<"$output"
	} >&2
	exit 2
fi

exit 0
