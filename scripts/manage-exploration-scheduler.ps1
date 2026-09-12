param(
  [ValidateSet('Status', 'Install', 'Uninstall')]
  [string]$Action,
  [string]$TaskName = 'WikiTree Exploration Scheduler',
  [string]$ProjectRoot = ''
)

$ErrorActionPreference = 'Stop'

if ($Action -eq 'Status') {
  $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($null -eq $task) {
    [Console]::Error.WriteLine('not_found')
    exit 2
  }
  Write-Output $task.State
  exit 0
}

if ($Action -eq 'Uninstall') {
  $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($null -ne $task) { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false }
  Write-Output 'removed'
  exit 0
}

$resolvedRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$launcher = Join-Path $resolvedRoot 'exploration-scheduler.vbs'
if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) { throw '找不到探索排程啟動檔。' }

$taskAction = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument ('//nologo "{0}"' -f $launcher) -WorkingDirectory $resolvedRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable:$false -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Days 3650) -RestartCount 1 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName $TaskName -Action $taskAction -Trigger $trigger -Principal $principal -Settings $settings -Description '登入後在背景執行 WikiTree 探索苗圃；錯過的時段不補跑。' -Force | Out-Null
Write-Output 'installed'
