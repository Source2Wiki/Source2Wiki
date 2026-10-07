#!/usr/bin/env bash
# Prints the Cloudflare Preview name for a pull request, which is also the first label of its url,
# https://<name>.preview.source2.wiki
#
#   preview-name.sh <pull request number> <head branch>
#
# The branch name comes from whoever opened the pull request, forks included, so it is reduced to
# lowercase letters, digits and dashes, and cut short enough that the longer per deployment urls
# (<deployment id>-<name>.preview.source2.wiki) still fit in a 63 character dns label.
#
# Used by both preview-deploy.yml and preview-cleanup.yml, they must agree on the name.
set -euo pipefail

number="$1"
branch="${2:-}"

if ! [[ "$number" =~ ^[0-9]+$ ]]; then
  echo "not a pull request number: '$number'" >&2
  exit 1
fi

slug=$(printf '%s' "$branch" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9' '-' | tr -s '-')
slug="${slug#-}"
slug="${slug:0:40}"
slug="${slug%-}"

if [ -n "$slug" ]; then
  echo "$number-$slug"
else
  echo "$number"
fi
