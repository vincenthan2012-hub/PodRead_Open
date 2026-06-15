@echo off
:: -------------------------------------------------
:: PodRead Windows startup script
:: -------------------------------------------------

cd /d "%~dp0"
set "ROOT=%CD%"

chcp 65001 >nul 2>&1

echo ========================================
echo   PodRead Windows Startup
echo ========================================
echo.

set "ENV_FILE=%ROOT%\.env"
set "ENV_EXAMPLE=%ROOT%\env.example"
set "SERVER_MOD=%ROOT%\server\node_modules"
set "FRONT_MOD=%ROOT%\node_modules"
set "APP_PORT=3000"
if exist "%ENV_FILE%" (
  for /f "usebackq tokens=1,* delims==" %%a in (`findstr /b /i "PORT=" "%ENV_FILE%" 2^>nul`) do (
    for /f "tokens=* delims= " %%p in ("%%b") do set "APP_PORT=%%p"
  )
)

echo [1/5] Checking Node.js ...
node -v >nul 2>&1
if errorlevel 1 goto :error_no_node
echo OK: Node.js ready
echo.

echo [2/5] Checking npm ...
call npm -v >nul 2>&1
if errorlevel 1 goto :error_no_npm
echo OK: npm ready
echo.

echo [3/5] Checking .env ...
if exist "%ENV_FILE%" goto :env_skip
if not exist "%ENV_EXAMPLE%" goto :error_no_env
copy /Y "%ENV_EXAMPLE%" "%ENV_FILE%" >nul
echo NOTE: Created .env from env.example. Please configure API keys later.
echo.
:env_skip
echo OK: .env ready
echo.

echo [4/5] Installing frontend dependencies ...
if exist "%FRONT_MOD%" goto :front_skip
echo Installing frontend dependencies, please wait...
call npm install
if errorlevel 1 goto :error_front
:front_skip
echo OK: frontend dependencies ready
echo.

echo [5/5] Installing backend dependencies ...
if exist "%SERVER_MOD%" goto :server_skip
cd /d "%ROOT%\server"
echo Installing backend dependencies, please wait...
call npm install
if errorlevel 1 goto :error_server
cd /d "%ROOT%"
:server_skip
echo OK: backend dependencies ready
echo.

echo [6/7] Building frontend ...
cd /d "%ROOT%"
call npm run build
if errorlevel 1 goto :error_build
echo OK: frontend build complete
echo.

echo [7/7] Freeing port %APP_PORT% and starting ...
call :free_port
echo OK: port %APP_PORT% is ready
echo.

echo ========================================
echo PodRead is starting. Do NOT close this window.
echo Open http://localhost:%APP_PORT% in your browser
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server\index-unified.js

echo.
echo Server process ended.
pause
exit /b

:error_no_node
echo.
echo [ERROR] Node.js not found!
echo Install Node.js 18+ from https://nodejs.org
pause
exit /b 1

:error_no_npm
echo.
echo [ERROR] npm not found! Please reinstall Node.js.
pause
exit /b 1

:error_no_env
echo.
echo [ERROR] Missing env.example, cannot create .env
pause
exit /b 1

:error_front
echo.
echo [ERROR] Frontend npm install failed. Check network and retry.
pause
exit /b 1

:error_server
echo.
echo [ERROR] Backend npm install failed. Check network and retry.
pause
exit /b 1

:error_build
echo.
echo [ERROR] Frontend build failed. See error log above.
pause
exit /b 1

:free_port
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%APP_PORT%" ^| findstr "LISTENING"') do (
  if not "%%p"=="0" (
    echo Stopping process PID %%p on port %APP_PORT% ...
    taskkill /F /PID %%p >nul 2>&1
  )
)
timeout /t 1 /nobreak >nul 2>&1
exit /b 0
