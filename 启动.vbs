Set ws = CreateObject("Wscript.Shell")
ws.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
ws.Run "pythonw run.py", 0, False
