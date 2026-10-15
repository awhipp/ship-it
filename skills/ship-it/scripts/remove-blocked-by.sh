#!/usr/bin/env bash
# scripts/remove-blocked-by.sh

set -e

CHILD_ID=$1
BLOCKER_ID=$2

if [ -z "$CHILD_ID" ] || [ -z "$BLOCKER_ID" ]; then
  echo "Usage: $0 <child_id> <blocker_id>"
  exit 1
fi

gh api graphql -F childId="$CHILD_ID" -F blockerId="$BLOCKER_ID" -f query='
mutation($childId: ID!, $blockerId: ID!) {
  removeBlockedBy(input: { issueId: $childId, blockingIssueId: $blockerId }) {
    blockingIssue { number }
  }
}'
