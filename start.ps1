# PHYTERA Agrotech PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          PHYTERA AGROTECH - DEMARRAGE             " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Demarrage du Backend NestJS et du Frontend Vite..." -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\phyterabackend-main'; npx nest start --watch"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir'; npm run dev"

Write-Host ""
Write-Host "Serveurs avances sous PowerShell:" -ForegroundColor Green
Write-Host "- Backend NestJS:   http://localhost:3000/api/v1" -ForegroundColor Cyan
Write-Host "- Frontend Vite:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
