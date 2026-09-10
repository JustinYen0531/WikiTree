$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$targetDir = $PSScriptRoot
$shortcutPath = Join-Path $desktop "WikiTree.lnk"

$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $targetDir "launcher.bat"
$shortcut.WorkingDirectory = $targetDir
$iconPath = Join-Path $targetDir "WikiTree.ico"
if (Test-Path $iconPath) {
    $shortcut.IconLocation = "$iconPath,0"
}
$shortcut.Description = "WikiTree - 最新版本桌面啟動器"
$shortcut.Save()

Write-Host "成功在桌面建立捷徑: $shortcutPath" -ForegroundColor Green
