param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$Remote = "origin",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

function Write-BackupLog {
    param([string]$Message)

    $logDir = Join-Path $RepoRoot ".auto-backup"
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path (Join-Path $logDir "auto-backup.log") -Value "[$timestamp] $Message"
}

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)

    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE"
    }
}

function Get-AheadCount {
    $upstreamRef = "$Remote/$Branch"
    $aheadText = & git rev-list --count "$upstreamRef..HEAD" 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($aheadText)) {
        return 0
    }

    return [int]$aheadText.Trim()
}

try {
    Set-Location $RepoRoot

    $insideWorkTree = & git rev-parse --is-inside-work-tree 2>$null
    if ($LASTEXITCODE -ne 0 -or $insideWorkTree -ne "true") {
        throw "RepoRoot is not a git work tree: $RepoRoot"
    }

    $status = & git status --porcelain
    if ($LASTEXITCODE -ne 0) {
        throw "git status failed with exit code $LASTEXITCODE"
    }

    if ([string]::IsNullOrWhiteSpace($status)) {
        $aheadCount = Get-AheadCount
        if ($aheadCount -le 0) {
            Write-BackupLog "No file changes and no unpushed commits."
            exit 0
        }

        Invoke-Git push $Remote $Branch
        Write-BackupLog "Pushed $aheadCount pending commit(s) to $Remote/$Branch."
        exit 0
    }

    Invoke-Git add -A

    $stagedStatus = & git status --porcelain
    if ($LASTEXITCODE -ne 0) {
        throw "git status after add failed with exit code $LASTEXITCODE"
    }

    if ([string]::IsNullOrWhiteSpace($stagedStatus)) {
        Write-BackupLog "No staged changes after git add."
        exit 0
    }

    $commitTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Invoke-Git commit -m "Auto backup: $commitTime"
    Invoke-Git push $Remote $Branch

    Write-BackupLog "Committed and pushed current repo changes to $Remote/$Branch."
}
catch {
    Write-BackupLog "FAILED: $($_.Exception.Message)"
    exit 1
}
