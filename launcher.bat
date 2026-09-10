@echo off
chcp 65001 >nul
cd /d "%~dp0"
title WikiTree 桌面啟動器
node launcher.mjs
if errorlevel 1 (
    echo.
    echo 啟動發生異常，請檢查訊息。
    pause
)
