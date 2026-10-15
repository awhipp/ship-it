param(
    [Parameter(Mandatory=$true)][string]$ParentId,
    [Parameter(Mandatory=$true)][string]$ChildId
)

$ErrorActionPreference = 'Stop'

gh api graphql -F parentId="$ParentId" -F childId="$ChildId" -f query='
mutation($parentId: ID!, $childId: ID!) {
  removeSubIssue(input: { issueId: $parentId, subIssueId: $childId }) {
    issue { number }
    subIssue { number }
  }
}'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
