# Auto Backup

This task performs lightweight Git-based auto backup for this repository.

It does not copy the project into a second backup folder. It only checks the current Git work tree, commits changed files, and pushes the commit to GitHub.

## Scope

Only this repository is included:

```text
C:\Users\zhang\Desktop\Ashrail Exodus Train
```

The script does not scan the whole Desktop, other code folders, or the whole computer.

## Behavior

- If there are no file changes and no pending local commits, it exits.
- If there are local commits that were not pushed, it tries to push them.
- If there are file changes, it runs `git add -A`, creates a timestamped commit, then pushes to `origin/main`.
- Logs are written to `.auto-backup/auto-backup.log`.

## Install Daily Task

```powershell
.\scripts\install-auto-backup-task.ps1 -DailyAt 23:30
```

Task name:

```text
AshrailExodusTrainAutoBackup
```

The task is not a resident background process. Windows Task Scheduler starts PowerShell at the configured time, the script commits and pushes if needed, then the process exits.

## Disable Task

```powershell
Disable-ScheduledTask -TaskName AshrailExodusTrainAutoBackup
```

## Enable Task

```powershell
Enable-ScheduledTask -TaskName AshrailExodusTrainAutoBackup
```

## Remove Task

```powershell
Unregister-ScheduledTask -TaskName AshrailExodusTrainAutoBackup -Confirm:$false
```

## Old Local Mirror

An older implementation used `.auto-backup/repo` as a second local mirror repository. That design has been removed because it duplicated project files and could become expensive for UE5 assets.
