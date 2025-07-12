@echo off
echo ====================================
echo ProductInsight AI - Starting App
echo ====================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo Choose the LTS version for best compatibility.
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version

echo.
echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies... This may take a few minutes.
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        echo Make sure you have a stable internet connection and try again.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
) else (
    echo Dependencies already installed.
)

echo.
echo Checking for .env file...
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and add your GEMINI_API_KEY
    echo Get your free API key from: https://ai.google.dev/
    echo.
    echo Creating .env file from template...
    copy ".env.example" ".env" >nul
    echo.
    echo IMPORTANT: Please edit the .env file and replace 'your_gemini_api_key_here' 
    echo with your actual API key from https://ai.google.dev/
    echo.
    echo After updating the .env file, run this script again.
    pause
    exit /b 1
)

echo Checking if API key is configured...
findstr /C:"your_gemini_api_key_here" ".env" >nul
if %errorlevel% equ 0 (
    echo WARNING: Please replace 'your_gemini_api_key_here' in .env with your actual API key!
    echo Get your free API key from: https://ai.google.dev/
    pause
    exit /b 1
)

echo Configuration found!
echo.
echo Starting ProductInsight AI...
echo The app will be available at: http://localhost:5000
echo Press Ctrl+C to stop the application.
echo.

npm run dev