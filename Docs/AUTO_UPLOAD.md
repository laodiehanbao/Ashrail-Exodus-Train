# Auto Upload

This project can be backed up to GitHub every 10 minutes through a local Windows Scheduled Task.

## Install

Run from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-auto-upload-task.ps1
```

The task name is `AshrailExodusTrainAutoUpload`.

## Behavior

- Every 10 minutes, `scripts/auto-upload.ps1` checks the git work tree.
- If there are no changes, it exits without making a commit.
- If there are changes, it runs `git add -A`, creates a timestamped commit, then pushes to `origin/main`.
- Upload logs are written to `.auto-upload/auto-upload.log`.

## Manual Test

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\auto-upload.ps1
```

## Uninstall

```powershell
Unregister-ScheduledTask -TaskName AshrailExodusTrainAutoUpload -Confirm:$false
```

## Notes

- GitHub credentials must already be available to local git, for example through Git Credential Manager.
- The script intentionally does not create empty commits.
- If local and remote history diverge, resolve git conflicts manually before relying on the scheduled task again.
