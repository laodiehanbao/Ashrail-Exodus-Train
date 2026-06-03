param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$Remote = "origin",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

function Write-UploadLog {
    param([string]$Message)

    $logDir = Join-Path $RepoRoot ".auto-upload"
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path (Join-Path $logDir "auto-upload.log") -Value "[$timestamp] $Message"
}

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)

    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE"
    }
}

try {
    Set-Location $RepoRoot

    $insideWorkTree = & git rev-parse --is-inside-work-tree 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "git rev-parse failed with exit code $LASTEXITCODE"
    }

    if ($insideWorkTree -ne "true") {
        throw "RepoRoot is not a git work tree: $RepoRoot"
    }

    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Invoke-Git push $Remote $Branch
        Write-UploadLog "No file changes. Checked for unpushed commits on $Remote/$Branch."
        exit 0
    }

    Invoke-Git add -A

    $commitStatus = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($commitStatus)) {
        Write-UploadLog "No staged changes after git add."
        exit 0
    }

    $commitTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Invoke-Git commit -m "Auto upload: $commitTime"
    Invoke-Git push $Remote $Branch

    Write-UploadLog "Uploaded changes to $Remote/$Branch."
}
catch {
    Write-UploadLog "FAILED: $($_.Exception.Message)"
    exit 1
}
