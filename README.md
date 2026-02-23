# Generador de Estudios Socioeconómicos

Aplicación full stack para capturar información de candidatos y generar un **PDF de Estudio Socioeconómico**.

- **Frontend:** React + Vite + Tailwind (`WEB/app`)
- **Backend:** Express + EJS + Puppeteer + pdf-lib (`server`)
- **Contenedor:** Docker multi-stage para producción

## Tabla de contenido

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Ejecución en desarrollo](#ejecución-en-desarrollo)
- [Build y ejecución en producción (sin Docker)](#build-y-ejecución-en-producción-sin-docker)
- [Variables de entorno](#variables-de-entorno)
- [API](#api)
- [Docker](#docker)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Flujo funcional](#flujo-funcional)
- [Solución de problemas](#solución-de-problemas)

## Características

- Formulario multi-sección para estudio socioeconómico.
- Manejo de datos dinámicos (familiares, empleos, referencias, ingresos/egresos, etc.).
- Carga de fotos en base64 para incrustarlas en el reporte.
- Carga de **documentos PDF extra** y fusión al PDF final.
- Marca de agua y logotipo institucional en el documento generado.
- Endpoint de salud para monitoreo.

## Arquitectura

### Frontend (Vite)

- Vive en `WEB/app`.
- En desarrollo usa proxy de Vite para redirigir `/api` al backend (`http://localhost:3001`).
- Puede usar `VITE_API_URL` para apuntar a un backend remoto.

### Backend (Express)

- Vive en `server`.
- Renderiza una plantilla EJS (`server/templates/socioeconomico.ejs`) con datos del formulario.
- Genera el PDF con Puppeteer.
- Si llegan PDFs extra, los fusiona al resultado con `pdf-lib`.
- En producción puede servir el frontend estático desde `WEB/app/dist`.

## Requisitos

- Node.js 20+
- npm 9+
- Para entorno local del backend con Puppeteer, el sistema debe poder ejecutar Chromium/Chrome (en Docker ya viene configurado).

## Instalación

Desde la raíz del proyecto:

```bash
npm install
npm run install:all
```

Esto instala:

- Dependencias de la raíz (incluye `concurrently`).
- Dependencias del frontend en `WEB/app`.
- Dependencias del backend en `server`.

## Ejecución en desarrollo

Desde la raíz:

```bash
npm run dev
```

Este comando levanta en paralelo:

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

Comandos útiles:

```bash
npm run dev:server   # Solo backend
npm run dev:client   # Solo frontend
```

## Build y ejecución en producción (sin Docker)

1) Compilar frontend:

```bash
npm run build
```

2) Iniciar backend en modo producción:

```bash
npm run start
```

Con `NODE_ENV=production`, el backend sirve los archivos estáticos de `WEB/app/dist`.

## Variables de entorno

### Backend

- `PORT` (opcional): puerto del servidor (default: `3001`).
- `NODE_ENV` (opcional): `development` o `production`.
- `FRONTEND_URLS` (opcional): lista de orígenes permitidos por CORS separados por coma.
  - Ejemplo: `https://mi-frontend.com,https://admin.mi-frontend.com`
- `PUPPETEER_EXECUTABLE_PATH` (opcional): ruta al ejecutable de Chromium/Chrome para Puppeteer.
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` (opcional): útil en contenedores para no descargar Chromium extra.

### Frontend

- `VITE_API_URL` (opcional): URL base del backend.
  - Si no se define, usa ruta relativa y en desarrollo funciona mediante proxy de Vite.
  - Ejemplo: `VITE_API_URL=https://mi-backend.com`

## API

### `GET /api/health`

Verifica estado del servicio.

**Respuesta ejemplo:**

```json
{
  "status": "ok",
  "service": "ESE PDF Generator",
  "logoLoaded": true,
  "timestamp": "2026-02-22T00:00:00.000Z"
}
```

### `POST /api/generate-pdf`

Genera el PDF del estudio.

- **Content-Type:** `application/json`
- **Body:** objeto completo del formulario (datos generales, docs, estudios, sociales, dinámicos, fotos, extras).
- **Respuesta:** archivo PDF (`application/pdf`) descargable.

> Nota: si `documentosExtras` contiene PDFs válidos en base64, se fusionan al final del reporte.

## Docker

### Construir imagen

```bash
docker build -t generador-socioeconomicos .
```

### Ejecutar contenedor

```bash
docker run --rm -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e FRONTEND_URLS=http://localhost:3001 \
  generador-socioeconomicos
```

Luego abre:

- `http://localhost:3001`

El Dockerfile:

- Compila frontend en un stage de build.
- Instala Chromium del sistema para Puppeteer.
- Copia backend + frontend compilado a la imagen final.

## Estructura del proyecto

```text
.
├── Dockerfile
├── package.json
├── server/
│   ├── index.js
│   ├── routes/pdf.js
│   ├── templates/socioeconomico.ejs
│   └── utils/puppeteer.js
└── WEB/
    ├── socioeconomico.jsx
    └── app/
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.jsx
            └── assets/
```

## Flujo funcional

1. Usuario captura información en el frontend.
2. Frontend envía JSON a `POST /api/generate-pdf`.
3. Backend normaliza datos y renderiza HTML con EJS.
4. Puppeteer convierte el HTML a PDF.
5. Si hay documentos extra, se fusionan con `pdf-lib`.
6. Se devuelve el PDF final para descarga.

## Solución de problemas

- **CORS bloqueado:** configura `FRONTEND_URLS` con los dominios reales del frontend.
- **Error al generar PDF en servidor/Linux:** valida `PUPPETEER_EXECUTABLE_PATH` y dependencias de Chromium.
- **El frontend no encuentra API:** define `VITE_API_URL` o usa el proxy local con `npm run dev`.
- **No carga logo/marca de agua:** confirma que exista `WEB/app/src/assets/nexplea.png`.

---