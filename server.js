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
const { testConnection, pool, query } = require('./db');

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
  : 'https://rastashoesdemo.onrender.com';

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
// ENDPOINT DE SALUD (mejorado con estado DB)
// =============================================
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
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

  // En desarrollo mostrar el error real, en producción ocultar
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  const errorMessage = isDev
    ? (err && err.message ? err.message : 'Error interno del servidor. Intenta nuevamente.')
    : 'Error interno del servidor. Intenta nuevamente.';

  res.status(500).json({
    success: false,
    error: errorMessage
  });
});

// =============================================
// GRACEFUL SHUTDOWN
// =============================================
const gracefulShutdown = async (signal) => {
  console.log(`\n📥 Señal ${signal} recibida. Cerrando servidor gracefulmente...`);
  try {
    await pool.end();
    console.log('🔌 Pool de PostgreSQL cerrado correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar el pool:', err.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =============================================
// INICIAR SERVIDOR
// =============================================
async function startServer() {
  // Probar conexión a la base de datos antes de iniciar
  console.log('🔄 Verificando conexión a PostgreSQL...');
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️  No se pudo conectar a la base de datos. El servidor iniciará pero las funciones de DB fallarán.');
    console.error('   📌 Verifica que DATABASE_URL esté definida en las variables de entorno de Render.');
    console.error('   📌 Si estás en Render, la URL se inyecta automáticamente al vincular PostgreSQL.');
    console.error('   📌 Si estás en local, crea un archivo .env con DATABASE_URL.');
    console.error('   📌 URL actual:', process.env.DATABASE_URL ? '✅ Definida' : '❌ NO DEFINIDA');
  } else {
    // =============================================
    // AUTO-CREACIÓN DE TABLA (solo si hay conexión DB)
    // =============================================
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS cotizaciones_rasta (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(120),
          correo VARCHAR(120),
          modelo VARCHAR(80),
          mensaje TEXT,
          fecha TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('📦 Tabla "cotizaciones_rasta" verificada/creada exitosamente.');
    } catch (tableError) {
      console.error('❌ Error al crear/verificar la tabla cotizaciones_rasta:', tableError.message);
    }
  }

  app.listen(PORT, () => {
    const portStr = String(PORT);
    const padding = ' '.repeat(Math.max(0, 32 - portStr.length));
    const urlStr = `http://localhost:${PORT}`;
    const urlPadding = ' '.repeat(Math.max(0, 30 - urlStr.length));
    const modeStr = process.env.NODE_ENV || 'development';
    const modePadding = ' '.repeat(Math.max(0, 30 - modeStr.length));
    const dbIcon = dbConnected ? '✅' : '⚠️';

    console.log(`
╔═══════════════════════════════════════════╗
║    🦁 ZAPATILLAS RASTA - API Server      ║
║    Puerto: ${PORT}${padding}║
║    ${urlStr}${urlPadding}║
║    Modo: ${modeStr}${modePadding}║
║    DB: ${dbIcon}${dbConnected ? ' Conectada' : ' Desconectada'}               ║
╚═══════════════════════════════════════════╝
    `);
  });
}

startServer();
