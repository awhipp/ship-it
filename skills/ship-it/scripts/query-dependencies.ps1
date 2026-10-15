param(
    [Parameter(Mandatory=$true)][string]$Owner,
    [Parameter(Mandatory=$true)][string]$Repo,
    [Parameter(Mandatory=$true)][string]$Number
)

$ErrorActionPreference = 'Stop'

$CleanNumber = [int]($Number.TrimStart('#'))

gh api graphql -F owner="$Owner" -F repo="$Repo" -F number=$CleanNumber -f query='
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
