# ============================================
# STAGE 1: Build del frontend (React + Vite)
# ============================================
FROM node:20-slim AS frontend-build

WORKDIR /build

# Copiar archivos de dependencias del frontend
COPY WEB/app/package.json WEB/app/package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar código fuente del frontend
COPY WEB/app/ ./

# Construir los archivos estáticos
RUN npm run build

# ============================================
# STAGE 2: Servidor de producción
# ============================================
FROM node:20-slim

# Instalar Chrome/Chromium y dependencias del sistema para Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Decirle a Puppeteer que use el Chromium del sistema (no descargue otro)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Crear directorio de la app
WORKDIR /app

# Copiar archivos de dependencias del servidor
COPY server/package.json server/package-lock.json* ./server/

# Instalar dependencias del servidor (solo producción)
RUN cd server && npm install --omit=dev

# Copiar código del servidor
COPY server/ ./server/

# Copiar el frontend ya construido desde stage 1
COPY --from=frontend-build /build/dist ./WEB/app/dist/

# Copiar las imágenes para el PDF
COPY WEB/app/src/assets/nexplea.png ./WEB/app/src/assets/nexplea.png
COPY WEB/app/src/assets/x.png ./WEB/app/src/assets/x.png

# Variable de entorno para producción
ENV NODE_ENV=production
ENV PORT=3001

# Exponer el puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "server/index.js"]
