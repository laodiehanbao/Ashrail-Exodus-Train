param(
    [string]$TaskName = "AshrailExodusTrainAutoUpload",
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [int]$IntervalMinutes = 10
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $RepoRoot "scripts\auto-upload.ps1"
if (-not (Test-Path $scriptPath)) {
    throw "Missing auto-upload script: $scriptPath"
}

$actionArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -RepoRoot `"$RepoRoot`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $actionArgs
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
    -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) `
    -RepetitionDuration ([TimeSpan]::MaxValue)
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
    -Description "Automatically commits and pushes Ashrail Exodus Train changes every $IntervalMinutes minutes." `
    -Force | Out-Null

Write-Host "Installed scheduled task '$TaskName' for every $IntervalMinutes minutes."
Write-Host "Log file: $(Join-Path $RepoRoot ".auto-upload\auto-upload.log")"
