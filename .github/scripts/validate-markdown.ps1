# .github/scripts/validate-markdown.ps1
# Validates internal markdown links and heading anchors across documentation.

$ErrorActionPreference = 'Stop'

Write-Host "=== Validating Markdown Links & Heading Anchors ==="

$docFiles = @(Get-ChildItem -Path "skills/ship-it" -Recurse -Filter "*.md")
if (Test-Path "README.md") {
    $docFiles += Get-Item "README.md"
}

$broken = @()
foreach ($file in $docFiles) {
    $content = Get-Content $file.FullName -Raw
    $linkMatches = [regex]::Matches($content, '\[([^\]]+)\]\(([^)]+)\)')
    foreach ($m in $linkMatches) {
        $link = $m.Groups[2].Value
        if ($link -notmatch '^https?://') {
            $parts = $link -split '#'
            $targetPath = $parts[0]
            $anchor = if ($parts.Length -gt 1) { $parts[1] } else { $null }
            $targetFile = if ($targetPath) {
                [System.IO.Path]::GetFullPath((Join-Path $file.DirectoryName $targetPath))
            } else {
                $file.FullName
            }

            if ($targetPath -and -not (Test-Path $targetFile)) {
                $broken += "BROKEN FILE LINK in $($file.Name): $link -> $targetFile"
            } elseif ($anchor) {
                $targetLines = Get-Content $targetFile
                $generatedAnchors = @()
                foreach ($line in $targetLines) {
                    if ($line -match '^#{1,6}\s+(.*)$') {
                        $headingText = $Matches[1].Trim()
                        # GitHub Markdown heading anchor algorithm
                        $slug = $headingText.ToLower() -replace '`', '' -replace '\[([^\]]+)\]\([^)]+\)', '$1' -replace '[^\w\s-]', ''
                        $slug = $slug.Trim() -replace '\s+', '-'
                        $generatedAnchors += $slug
                    }
                }
                if ($anchor -notin $generatedAnchors) {
                    $broken += "BROKEN ANCHOR in $($file.Name): link '$link' -> anchor '$anchor' not found in $([System.IO.Path]::GetFileName($targetFile))"
                }
            }
        }
    }
}

if ($broken.Count -gt 0) {
    $broken | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Host "All internal file links and heading anchors verified clean."
