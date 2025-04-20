@echo off
echo Conectando repositorio a GitHub...
echo.

set /p usuario=Introduce tu nombre de usuario de GitHub: 
set /p repo=Introduce el nombre del repositorio (por defecto "qr-access"): 

if "%repo%"=="" set repo=qr-access

echo.
echo Conectando con https://github.com/%usuario%/%repo%.git
echo.

git remote add origin https://github.com/%usuario%/%repo%.git

echo Verificando la rama principal...
for /f "tokens=*" %%a in ('git branch --show-current') do set rama=%%a

if "%rama%"=="main" (
    echo Rama principal: main
    git push -u origin main
) else (
    echo Rama principal: master
    git push -u origin master
)

echo.
echo =====================================================
echo Si todo salió bien, tu código ahora está en GitHub!
echo Visita: https://github.com/%usuario%/%repo%
echo =====================================================
echo.
pause
