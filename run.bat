@echo off
setlocal enabledelayedexpansion

echo ====================================
echo Docusaurus Startup
echo ====================================

:: check if node is installed
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js is already installed.
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo Current version: !NODE_VERSION!
    goto :check_version
)

echo Node.js not found on this system.
echo.
echo Would you like to automatically install Node.js? (y/n)
set /p INSTALL_CHOICE="> "

if /i "!INSTALL_CHOICE!" neq "y" (
    echo.
    echo Please install Node.js manually from: https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
)

winget --version >nul 2>&1

if %errorlevel%==0 (
    echo Winget is available on this system.
) else (
    echo Winget is not available on this system.
    echo.
    echo Winget is required for automatic installation.
    echo Please either:
    echo 1. Update Windows to the latest version ^(winget comes with Windows 10 1709+ and Windows 11^)
    echo 2. Install winget from the Microsoft Store ^(App Installer^)
    echo 3. Install Node.js manually from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: install Node.js using winget
echo.
echo Installing Node.js using winget...
echo This may take a bit...
echo.

winget install OpenJS.NodeJS --accept-package-agreements --accept-source-agreements --silent

if %errorlevel% neq 0 (
    echo.
    echo Installation failed.
    echo Please try one of these alternatives:
    echo 1. Run as Administrator and try again
    echo 2. Install Node.js manually from: https://nodejs.org/
    echo 3. Use 'winget install OpenJS.NodeJS' manually
    echo.
    pause
    exit /b 1
)

echo.
echo Node.js installation completed!
echo.
echo Refreshing environment variables...
echo Please wait...

:: refresh environment variables without restarting
call :refresh_env

:: check if Node.js is now available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Node.js was installed but is not yet available in PATH.
    echo Please close this command prompt and open a new one.
    echo Then run this script again to continue with the project setup.
    echo.
    pause
    exit /b 0
)

echo Node.js is now available!
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Version: !NODE_VERSION!

:check_version
:: docusaurus needs node 20 or newer, keep in sync with "engines" in package.json
for /f "tokens=1 delims=v." %%m in ("!NODE_VERSION!") do set NODE_MAJOR=%%m
if !NODE_MAJOR! lss 20 (
    echo.
    echo Node.js !NODE_VERSION! is too old, this project needs version 20 or newer.
    echo Please update it, either with 'winget upgrade OpenJS.NodeJS'
    echo or by installing the latest LTS from: https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

:start
:: start the development server
call npm start

if %errorlevel% neq 0 (
    echo.
    echo Failed to start the development server.
    echo Please check the project configuration and try running 'npm start' manually.
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
echo The development server should now be running.
echo.
pause

:: function to refresh environment variables
:refresh_env
echo Refreshing PATH...
for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SysPath=%%B"
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "UserPath=%%B"
if defined UserPath (
    set "PATH=%SysPath%;%UserPath%"
) else (
    set "PATH=%SysPath%"
)
goto :eof