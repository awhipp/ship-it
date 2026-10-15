param(
    [Parameter(Mandatory=$true)][string]$ChildId,
    [Parameter(Mandatory=$true)][string]$BlockerId
)

$ErrorActionPreference = 'Stop'

gh api graphql -F childId="$ChildId" -F blockerId="$BlockerId" -f query='
mutation($childId: ID!, $blockerId: ID!) {
  removeBlockedBy(input: { issueId: $childId, blockingIssueId: $blockerId }) {
    blockingIssue { number }
  }
}'
