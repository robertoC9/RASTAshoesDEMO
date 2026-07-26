/**
 * =============================================
 * server.js - Servidor Express API
 * Zapatillas RASTA - Sistema de Cotización
 * =============================================
 * Endpoints:
 *  POST /api/cotizacion  - Crear una nueva cotización
 *  GET  /api/cotizaciones - Listar todas las cotizaciones
 *  GET  /api/health       - Verificar estado del servidor
 * =============================================
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const cotizacionRoutes = require('./routes/cotizacionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// MIDDLEWARE GLOBAL
// =============================================

// Configuración CORS basada en el entorno y el URL público de Render
const isProduction = process.env.NODE_ENV === 'production';
const localOrigin = 'http://localhost:3000';
const renderOrigin = process.env.RENDER_EXTERNAL_URL
  ? new URL(process.env.RENDER_EXTERNAL_URL).origin
  : 'https://zapatillas-rasta.onrender.com';

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([
  ...envOrigins,
  renderOrigin,
  ...(isProduction ? [] : [localOrigin])
]));

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (herramientas de prueba, servidores backend, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// ARCHIVOS ESTÁTICOS
// =============================================
// Sirve todos los archivos desde /public (HTML, CSS, JS, imágenes, audio, SVG)
// Render espera que los archivos públicos estén en una subcarpeta dedicada
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// RUTAS
// =============================================
app.use('/api', cotizacionRoutes);

// =============================================
// RUTA PRINCIPAL - Sirve index.html desde /public
// =============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================================
// ENDPOINT DE SALUD
// =============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// =============================================
// MIDDLEWARE DE ERRORES GLOBAL
// =============================================
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err);

  // Errores de CORS
  if (err && err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado por política CORS.'
    });
  }

  const errorMessage = process.env.NODE_ENV === 'development'
    ? (err && err.message ? err.message : 'Error interno del servidor. Intenta nuevamente.')
    : 'Error interno del servidor. Intenta nuevamente.';

  res.status(500).json({
    success: false,
    error: errorMessage
  });
});

// =============================================
// INICIAR SERVIDOR
// =============================================
app.listen(PORT, () => {
  const portStr = String(PORT);
  const padding = ' '.repeat(Math.max(0, 32 - portStr.length));
  const urlStr = `http://localhost:${PORT}`;
  const urlPadding = ' '.repeat(Math.max(0, 30 - urlStr.length));
  const modeStr = process.env.NODE_ENV || 'development';
  const modePadding = ' '.repeat(Math.max(0, 30 - modeStr.length));

  console.log(`
╔═══════════════════════════════════════════╗
║    🦁 ZAPATILLAS RASTA - API Server      ║
║    Puerto: ${PORT}${padding}║
║    ${urlStr}${urlPadding}║
║    Modo: ${modeStr}${modePadding}║
╚═══════════════════════════════════════════╝
  `);
});

