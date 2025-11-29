# كيفية إيقاف السيرفر

## إذا كان السيرفر شغال في Terminal:

اضغط `Ctrl + C` في الـ terminal اللي السيرفر شغال فيه.

## إذا كان السيرفر شغال في الخلفية:

### في PowerShell:
```powershell
# إيجاد الـ Process ID
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess

# إيقاف السيرفر (استبدل <PID> بالرقم اللي طلع)
Stop-Process -Id <PID> -Force
```

### في Command Prompt:
```cmd
# إيجاد الـ Process ID
netstat -ano | findstr :4000

# إيقاف السيرفر (استبدل <PID> بالرقم اللي طلع)
taskkill /PID <PID> /F
```

## مثال:

لو الـ Process ID هو `6604`:
```powershell
Stop-Process -Id 6604 -Force
```

أو:
```cmd
taskkill /PID 6604 /F
```

