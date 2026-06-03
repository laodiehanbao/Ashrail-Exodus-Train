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

try {
    Set-Location $RepoRoot

    $insideWorkTree = git rev-parse --is-inside-work-tree 2>$null
    if ($insideWorkTree -ne "true") {
        throw "RepoRoot is not a git work tree: $RepoRoot"
    }

    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-UploadLog "No changes to upload."
        exit 0
    }

    git add -A

    $commitStatus = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($commitStatus)) {
        Write-UploadLog "No staged changes after git add."
        exit 0
    }

    $commitTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto upload: $commitTime"
    git push $Remote $Branch

    Write-UploadLog "Uploaded changes to $Remote/$Branch."
}
catch {
    Write-UploadLog "FAILED: $($_.Exception.Message)"
    exit 1
}
