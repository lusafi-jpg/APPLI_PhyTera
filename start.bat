@echo off
title PHYTERA Agrotech Launcher
echo ===================================================
echo           PHYTERA AGROTECH - DEMARRAGE
echo ===================================================
echo Demarrage simultane du Backend NestJS et du Frontend Vite...
echo.

echo 1. Lancement du serveur Backend NestJS (Port 3000)...
start "PHYTERA Backend NestJS" cmd /k "cd /d %~dp0phyterabackend-main && npx nest start --watch"

echo 2. Lancement du serveur Frontend Vite (Port 5173)...
start "PHYTERA Frontend Vite" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ===================================================
echo PHYTERA est en cours d'execution !
echo - Backend NestJS API : http://localhost:3000/api/v1
echo - Application Frontend: http://localhost:5173
echo ===================================================
pause
