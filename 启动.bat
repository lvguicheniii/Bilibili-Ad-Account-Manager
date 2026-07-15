@echo off
chcp 65001 >nul
title B站广告账户管理器 BAAM

cd /d "%~dp0"

echo.
echo ========================================
echo   B站广告账户管理器 BAAM v1.0
echo ========================================
echo.
echo 正在启动...
echo.

python run.py

if %errorlevel% neq 0 (
    echo.
    echo 启动失败！错误码: %errorlevel%
    echo.
    echo 请检查:
    echo   1. 是否已安装 Python 3.8+
    echo   2. 是否安装依赖: pip install -r requirements.txt
    echo   3. Windows 是否安装了 Edge WebView2 运行时
)

echo.
pause
