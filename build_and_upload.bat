@echo off
echo ============================================
echo Building Frontend Assets...
echo ============================================
call npm run build:local

echo.
echo ============================================
echo Build Complete! 
echo ============================================
echo.
echo Now follow these steps to upload:
echo 1. Open VS Code Command Palette (Ctrl+Shift+P)
echo 2. Type: SFTP: Upload Folder
echo 3. Select: public/build
echo.
echo OR use FileZilla with these credentials:
echo Host: petrodiesel.net
echo User: ftpetro@app.petrodiesel.net
echo Password: Petro@00105
echo Port: 21
echo Upload the folder: public/build to /public/build
echo ============================================
pause
