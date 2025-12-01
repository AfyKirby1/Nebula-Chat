@echo off
title Nebula Chat Server

echo Starting Redis Docker Container...
docker start ottre-redis
if %errorlevel% neq 0 (
    echo Failed to start Docker container 'ottre-redis'. Please ensure Docker is running and the container exists.
) else (
    echo Redis container started successfully.
)

echo.
echo Starting Gemini Chat Development Server...
echo.
powershell -NoExit -ExecutionPolicy Bypass -Command "npm run dev"
