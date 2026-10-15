#!/usr/bin/env bash
# scripts/query-dependencies.sh

set -e

OWNER=$1
REPO=$2
NUMBER=$3

if [ -z "$OWNER" ] || [ -z "$REPO" ] || [ -z "$NUMBER" ]; then
  echo "Usage: $0 <owner> <repo> <issue_number>"
  exit 1
fi

gh api graphql -F owner="$OWNER" -F repo="$REPO" -F number="$NUMBER" -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    issue(number: $number) {
      subIssuesSummary { total completed percentCompleted }
      subIssues(first: 100) { nodes { number state } }
      issueDependenciesSummary { blockedBy totalBlockedBy }
      blockedBy(first: 50) { nodes { number state } }
    }
  }
}'
