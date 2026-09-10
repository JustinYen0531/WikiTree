$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$targetDir = $PSScriptRoot
$shortcutPath = Join-Path $desktop "WikiTree.lnk"

$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "//nologo `"$targetDir\launcher.vbs`""
$shortcut.WorkingDirectory = $targetDir
$iconPath = Join-Path $targetDir "WikiTree.ico"
if (Test-Path $iconPath) {
    $shortcut.IconLocation = "$iconPath,0"
}
$shortcut.Description = "WikiTree - 知識生態系統"
$shortcut.Save()

Write-Host "成功更新桌面捷徑: $shortcutPath" -ForegroundColor Green
