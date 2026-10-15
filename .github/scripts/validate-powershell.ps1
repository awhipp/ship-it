# .github/scripts/validate-powershell.ps1
# Validates PowerShell syntax across all *.ps1 files using AST parsing.

$ErrorActionPreference = 'Stop'

Write-Host "=== Validating PowerShell Syntax (AST Parser) ==="

$scriptFiles = Get-ChildItem -Path "skills/ship-it/scripts/*.ps1"
$ciScriptFiles = Get-ChildItem -Path ".github/scripts/*.ps1" -ErrorAction SilentlyContinue
$allFiles = @($scriptFiles) + @($ciScriptFiles)

$hasError = $false
foreach ($file in $allFiles) {
    $tokens = $null
    $errors = $null
    [System.Management.Automation.Language.Parser]::ParseFile($file.FullName, [ref]$tokens, [ref]$errors) | Out-Null
    if ($errors.Count -gt 0) {
        Write-Error "Syntax error in $($file.Name): $($errors -join '; ')"
        $hasError = $true
    } else {
        Write-Host "Checking syntax: $($file.Name) - OK"
    }
}

if ($hasError) {
    exit 1
}

Write-Host "All PowerShell script checks passed successfully."
