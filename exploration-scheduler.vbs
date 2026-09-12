Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
projectRoot = fileSystem.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = projectRoot
shell.Run "node """ & projectRoot & "\exploration-scheduler-worker.cjs""", 0, False
