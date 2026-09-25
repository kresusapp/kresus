#!/bin/bash
# Install the git hooks shipped in support/githooks. See CONTRIBUTING.md.
set -e

cd "$(git rev-parse --show-toplevel)"

HOOKS_DIR="support/githooks"

shopt -s nullglob
HOOKS=("$HOOKS_DIR"/*)

if [ ${#HOOKS[@]} -eq 0 ]; then
    echo "error: no hooks found in $HOOKS_DIR." >&2
    exit 1
fi

# The exec bit is tracked by git, but it can get lost when the tree reaches the
# developer some other way (zip archive, restrictive umask, filesystem without
# permission support).
chmod +x "${HOOKS[@]}"

PREVIOUS=$(git config --local --get core.hooksPath || true)
if [ -n "$PREVIOUS" ] && [ "$PREVIOUS" != "$HOOKS_DIR" ]; then
    echo "warning: core.hooksPath was set to '$PREVIOUS', overriding it." >&2
fi

# This makes git use $HOOKS_DIR instead of .git/hooks, for every hook at once.
git config --local core.hooksPath "$HOOKS_DIR"

echo "Git hooks installed from $HOOKS_DIR:"
for hook in "${HOOKS[@]}"; do
    echo "  - $(basename "$hook")"
done
echo "Use 'git commit --no-verify' to skip them for a single commit."
