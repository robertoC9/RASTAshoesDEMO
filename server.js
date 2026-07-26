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

// Configuración CORS con orígenes permitidos desde .env
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST']
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
  console.error('❌ Error no controlado:', err.message);

  // Errores de CORS
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado por política CORS.'
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor. Intenta nuevamente.'
  });
});

// =============================================
// INICIAR SERVIDOR
// =============================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║    🦁 ZAPATILLAS RASTA - API Server      ║
║    Puerto: ${PORT}                            ║
║    http://localhost:${PORT}                  ║
║    Modo: ${process.env.NODE_ENV || 'development'}                        ║
╚═══════════════════════════════════════════╝
  `);
});

