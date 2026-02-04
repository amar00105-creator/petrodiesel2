@echo off
echo Starting Backup and Upload Process...

echo 1. Backing up Database (petrodiesel_db)...
c:\xampp\mysql\bin\mysqldump.exe -u root petrodiesel_db > petrodiesel_db_backup_latest.sql

if %ERRORLEVEL% NEQ 0 (
    echo Database backup failed! Please check your MySQL configuration.
    pause
    exit /b %ERRORLEVEL%
)

echo 2. Adding files to Git...
git add .

echo 3. Committing changes...
git commit -m "Update: Refined Fuel Pump Card, Edit Pump Modal, and Database Backup"

echo 4. Pushing to GitHub...
git push origin main

echo Done! Changes uploaded successfully.
pause
