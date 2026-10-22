@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0backend"
echo [1/3] 启动后端服务...
start "Backend" cmd /k "node src/server.js"

timeout /t 3 >nul

cd /d "%~dp0frontend"
echo [2/3] 启动前端服务...
start "Frontend" cmd /k "npm run dev"

timeout /t 5 >nul

echo [3/3] 打开浏览器...
start http://localhost:5173

echo.
echo ========================================
echo  系统启动完成！
echo  后端: http://localhost:3001
echo  前端: http://localhost:5173
echo ========================================
pause
