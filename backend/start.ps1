# C4 Payments - Server Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  C4 Payments - Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check if port 4000 is in use
$portInUse = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "WARNING: Port 4000 is already in use!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please stop the existing server first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To find and stop the process:" -ForegroundColor Yellow
    Write-Host "  Get-Process -Id $($portInUse.OwningProcess) | Stop-Process -Force" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Port 4000 is available." -ForegroundColor Green
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host ""

# Start the server
node src/server.js

