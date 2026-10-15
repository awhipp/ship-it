param(
    [Parameter(Mandatory=$true)][string]$ParentId,
    [Parameter(Mandatory=$true)][string]$ChildId
)

$ErrorActionPreference = 'Stop'

gh api graphql -F parentId="$ParentId" -F childId="$ChildId" -f query='
mutation($parentId: ID!, $childId: ID!) {
  addSubIssue(input: { issueId: $parentId, subIssueId: $childId }) {
    issue { number }
    subIssue { number }
  }
}'
