const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pdfRoutes = require('./routes/pdf');
const { closeBrowser } = require('./utils/puppeteer');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const frontendOrigins = (process.env.FRONTEND_URLS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const defaultProductionOrigins = ['https://generadorsocioeconomicosnexplea-production.up.railway.app'];

const devOrigins = ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'];
const allowedOrigins = isProduction
  ? (frontendOrigins.length ? frontendOrigins : defaultProductionOrigins)
  : [...new Set([...frontendOrigins, ...devOrigins])];

// --- MIDDLEWARE ---
app.use(helmet({
  contentSecurityPolicy: false // Desactivado para no interferir con las imágenes base64 en Puppeteer
}));

app.use(cors({
  origin: (origin, callback) => {
    // En producción, exigir origin
    if (!origin && !isProduction) return callback(null, true);
    if (!origin && isProduction) return callback(new Error('Origin required in production'));
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));

// Body parser con límite alto para fotos base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiter para la API de PDF (protección DoS)
const pdfLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Límite de 10 PDFs por minuto por IP
  message: { error: 'Demasiadas peticiones. Por favor, intenta de nuevo en un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- API ROUTES ---
app.use('/api/generate-pdf', pdfLimiter);
app.use('/api', pdfRoutes);

// --- PRODUCCIÓN: servir frontend estático ---
if (isProduction) {
  const frontendPath = path.join(__dirname, '..', 'WEB', 'app', 'dist');
  app.use(express.static(frontendPath));

  // SPA fallback: cualquier ruta no-API devuelve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  console.log(`📦 Serving frontend from ${frontendPath}`);
} else {
  // En desarrollo, mostrar info del servicio en la raíz
  app.get('/', (req, res) => {
    res.json({
      service: 'ESE PDF Generator',
      version: '1.0.0',
      endpoints: {
        health: 'GET /api/health',
        generatePdf: 'POST /api/generate-pdf',
      },
    });
  });
}

// --- START ---
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ESE PDF Server running on http://localhost:${PORT}`);
  console.log(`   Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`   Allowed CORS origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : '(none configured)'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   PDF endpoint: POST http://localhost:${PORT}/api/generate-pdf\n`);
});

// --- GRACEFUL SHUTDOWN ---
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  await closeBrowser();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown('UNCAUGHT_EX').catch(() => process.exit(1));
});
