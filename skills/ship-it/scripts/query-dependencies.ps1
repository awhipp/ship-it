param(
    [Parameter(Mandatory=$true)][string]$Owner,
    [Parameter(Mandatory=$true)][string]$Repo,
    [Parameter(Mandatory=$true)][int]$Number
)

$ErrorActionPreference = 'Stop'

gh api graphql -F owner="$Owner" -F repo="$Repo" -F number="$Number" -f query='
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
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
