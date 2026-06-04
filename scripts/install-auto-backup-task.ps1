param(
    [string]$TaskName = "AshrailExodusTrainAutoBackup",
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$DailyAt = "23:30"
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $RepoRoot "scripts\auto-backup.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing auto-backup script: $scriptPath"
}

$actionArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -RepoRoot `"$RepoRoot`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $actionArgs
$triggerTime = [DateTime]::ParseExact($DailyAt, "HH:mm", [Globalization.CultureInfo]::InvariantCulture)
$trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Commits and pushes Ashrail Exodus Train changes once per day at $DailyAt without copying the project to a second backup folder." `
    -Force | Out-Null

Write-Host "Installed scheduled task '$TaskName' for daily auto backup at $DailyAt."
Write-Host "Log file: $(Join-Path $RepoRoot ".auto-backup\auto-backup.log")"
