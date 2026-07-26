/**
 * =============================================
 * routes/cotizacionRoutes.js - Rutas de cotización
 * Zapatillas RASTA
 * =============================================
 * Define los endpoints REST para cotizaciones
 * =============================================
 */

const { Router } = require('express');
const router = Router();

const {
  crearCotizacion,
  listarCotizaciones
} = require('../controllers/cotizacionController');

const {
  cotizacionRules,
  validate
} = require('../middleware/validation');

// =============================================
// POST /api/cotizacion - Crear una cotización
// =============================================
router.post('/cotizacion', cotizacionRules, validate, crearCotizacion);

// =============================================
// GET /api/cotizaciones - Listar cotizaciones
// =============================================
router.get('/cotizaciones', listarCotizaciones);

module.exports = router;

