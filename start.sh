#!/bin/bash

echo "===================================="
echo "ProductInsight AI - Starting App"
echo "===================================="
echo

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from: https://nodejs.org/"
    echo "Choose the LTS version for best compatibility."
    exit 1
fi

echo "Node.js found! Version:"
node --version

echo
echo "Checking if dependencies are installed..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies... This may take a few minutes."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies!"
        echo "Make sure you have a stable internet connection and try again."
        exit 1
    fi
    echo "Dependencies installed successfully!"
else
    echo "Dependencies already installed."
fi

echo
echo "Checking for .env file..."
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo "Please copy .env.example to .env and add your GEMINI_API_KEY"
    echo "Get your free API key from: https://ai.google.dev/"
    echo
    echo "Creating .env file from template..."
    cp ".env.example" ".env"
    echo
    echo "IMPORTANT: Please edit the .env file and replace 'your_gemini_api_key_here'"
    echo "with your actual API key from https://ai.google.dev/"
    echo
    echo "After updating the .env file, run this script again."
    exit 1
fi

echo "Checking if API key is configured..."
if grep -q "your_gemini_api_key_here" ".env"; then
    echo "WARNING: Please replace 'your_gemini_api_key_here' in .env with your actual API key!"
    echo "Get your free API key from: https://ai.google.dev/"
    exit 1
fi

echo "Configuration found!"
echo
echo "Starting ProductInsight AI..."
echo "The app will be available at: http://localhost:5000"
echo "Press Ctrl+C to stop the application."
echo

npm run dev