@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

rem PodRead Windows 本地启动脚本
rem 支持从任意目录运行，使用脚本所在目录作为项目根目录

set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
set "ENV_FILE=%PROJECT_DIR%\.env"
set "ENV_EXAMPLE=%PROJECT_DIR%\env.example"
set "SERVER_DIR=%PROJECT_DIR%\server"

echo ========================================
echo   PodRead Windows 本地启动脚本
echo ========================================
echo.

echo [1/6] 检查 Node.js 环境...
where node >nul 2>nul
if errorlevel 1 (
  echo 错误: 未找到 Node.js
  echo 请先安装 Node.js 18 或更高版本: https://nodejs.org/
  pause
  exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node -v') do set "NODE_MAJOR=%%a"
set "NODE_MAJOR=%NODE_MAJOR:v=%"
if %NODE_MAJOR% LSS 18 (
  echo 错误: Node.js 版本过低 ^(当前: 
  node -v
  echo ^)
  echo 需要 Node.js 18 或更高版本
  pause
  exit /b 1
)

for /f %%v in ('node -v') do set "NODE_VERSION=%%v"
echo OK: Node.js 版本: %NODE_VERSION%
echo.

echo [2/6] 检查 npm...
where npm >nul 2>nul
if errorlevel 1 (
  echo 错误: 未找到 npm
  pause
  exit /b 1
)

for /f %%v in ('npm -v') do set "NPM_VERSION=%%v"
echo OK: npm 版本: %NPM_VERSION%
echo.

echo [3/6] 检查环境变量配置...
if not exist "%ENV_FILE%" (
  echo 未找到 .env 文件
  if exist "%ENV_EXAMPLE%" (
    echo 正在从 env.example 创建 .env 文件...
    copy "%ENV_EXAMPLE%" "%ENV_FILE%" >nul
    echo OK: 已创建 .env 文件
    echo 提示: AI 和 SMTP 配置均可在应用设置中填写；.env 只用于提供默认值
    echo.
    choice /C YN /N /M "是否现在用记事本编辑 .env 文件? (Y/N) "
    if errorlevel 2 (
      echo 跳过编辑 .env
    ) else (
      notepad "%ENV_FILE%"
    )
  ) else (
    echo 错误: 未找到 env.example 文件
    pause
    exit /b 1
  )
) else (
  echo OK: 找到 .env 文件
  echo 提示: 本项目使用浏览器 localStorage 保存章节和设置，无需数据库配置
)
echo.

echo [4/6] 检查项目依赖...
if not exist "%PROJECT_DIR%\node_modules" (
  echo 未找到 node_modules，正在安装依赖...
  pushd "%PROJECT_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    echo 错误: 依赖安装失败
    pause
    exit /b 1
  )
  popd
  echo OK: 依赖安装完成
) else (
  echo OK: 依赖已存在
  echo 提示: 如果遇到问题，可以运行 npm install 更新依赖
)
echo.

echo [5/6] 检查后端依赖...
if not exist "%SERVER_DIR%\node_modules" (
  echo 未找到后端 node_modules，正在安装依赖...
  pushd "%SERVER_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    echo 错误: 后端依赖安装失败
    pause
    exit /b 1
  )
  popd
  echo OK: 后端依赖安装完成
) else (
  echo OK: 后端依赖已存在
)
echo.

echo [6/6] 构建并启动统一服务器...
echo 项目目录: %PROJECT_DIR%
echo 前端: http://localhost:3000
echo 后端 API: http://localhost:3000/api/send-email
echo 下载 EPUB: http://localhost:3000/api/download-epub
echo 健康检查: http://localhost:3000/health
echo.
echo ========================================
echo   开发服务器启动中...
echo   按 Ctrl+C 停止服务器
echo ========================================
echo.

pushd "%PROJECT_DIR%"
call npm run build
if errorlevel 1 (
  popd
  echo 错误: 前端构建失败
  pause
  exit /b 1
)

echo.
echo OK: 前端构建完成
echo 启动统一服务器 ^(端口 3000^)...
echo.
node server\index-unified.js
set "SERVER_EXIT_CODE=%ERRORLEVEL%"
popd

echo.
echo 服务器已停止
if not "%SERVER_EXIT_CODE%"=="0" (
  echo 退出码: %SERVER_EXIT_CODE%
)
pause
exit /b %SERVER_EXIT_CODE%
