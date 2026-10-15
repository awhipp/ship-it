#!/usr/bin/env bash
# scripts/add-sub-issue.sh

set -e

PARENT_ID=$1
CHILD_ID=$2

if [ -z "$PARENT_ID" ] || [ -z "$CHILD_ID" ]; then
  echo "Usage: $0 <parent_id> <child_id>"
  exit 1
fi

gh api graphql -F parentId="$PARENT_ID" -F childId="$CHILD_ID" -f query='
mutation($parentId: ID!, $childId: ID!) {
  addSubIssue(input: { issueId: $parentId, subIssueId: $childId }) {
    issue { number }
    subIssue { number }
  }
}'
