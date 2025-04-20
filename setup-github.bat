@echo off
echo Inicializando repositorio Git para QR Access Control...

REM Inicializar repositorio Git
git init

REM Añadir todos los archivos
git add .

REM Hacer el primer commit
git commit -m "Primer commit: QR Access Control"

echo.
echo =====================================================
echo Repositorio Git inicializado correctamente!
echo.
echo Ahora debes:
echo 1. Crear un repositorio en GitHub (https://github.com/new)
echo 2. Ejecutar estos comandos (reemplaza TU_USUARIO por tu nombre de usuario):
echo.
echo    git remote add origin https://github.com/TU_USUARIO/qr-access.git
echo    git push -u origin main
echo.
echo (Si tu rama principal se llama "master" en lugar de "main", usa "master")
echo =====================================================
echo.
pause
