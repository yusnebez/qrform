# QR Access Control

Sistema de control de acceso mediante códigos QR para abonados.

## Características

- Gestión de abonados (crear, listar, importar desde CSV)
- Generación de códigos QR basados en UUIDs únicos
- Validación de acceso con bloqueo temporal de 3 horas entre usos
- Interfaz para escanear y verificar códigos QR
- Funcionalidad para descargar y compartir códigos QR
- Estadísticas de uso

## Tecnologías

- Next.js
- MongoDB
- Tailwind CSS
- HTML5-QRCode (para escaneo de QR)
- QRCode (para generación de QR)

## Configuración

1. Clona el repositorio
2. Instala las dependencias:
   ```
   npm install
   ```
3. Crea un archivo `.env.local` con las siguientes variables:
   ```
   MONGODB_URI=tu_url_de_mongodb
   NEXT_PUBLIC_APP_URL=tu_url_de_la_app
   ```
4. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

## Despliegue

Este proyecto está configurado para ser desplegado en Vercel.

## Credenciales de administración

- Usuario: `admin`
- Contraseña: `Prueba123`

## Licencia

MIT
