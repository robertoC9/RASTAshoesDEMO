/**
 * =============================================
 * controllers/cotizacionController.js
 * Zapatillas RASTA - Lógica de negocio
 * =============================================
 * Maneja la creación y consulta de cotizaciones
 * =============================================
 */

const db = require('../db');

// =============================================
// POST /api/cotizacion - Crear cotización
// =============================================
const crearCotizacion = async (req, res, next) => {
  try {
    const { nombre, correo, modelo, mensaje } = req.body || {};

    const nombreTrim = typeof nombre === 'string' ? nombre.trim() : '';
    const correoTrim = typeof correo === 'string' ? correo.trim() : '';
    const modeloTrim = typeof modelo === 'string' ? modelo.trim() : '';
    const mensajeTrim = typeof mensaje === 'string' ? mensaje.trim() : '';

    if (!nombreTrim || !correoTrim || !modeloTrim) {
      console.warn('⚠️ Request inválido en /api/cotizacion:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Nombre, correo y modelo son obligatorios.'
      });
    }

    if (!correoTrim.includes('@')) {
      console.warn('⚠️ Correo inválido en /api/cotizacion:', correoTrim);
      return res.status(400).json({
        success: false,
        error: 'Ingresa un correo electrónico válido.'
      });
    }

    const result = await db.query(
      `INSERT INTO cotizaciones_rasta (nombre, correo, modelo, mensaje)
       VALUES ($1, $2, $3, $4)
       RETURNING id, fecha`,
      [nombreTrim, correoTrim, modeloTrim, mensajeTrim || null]
    );

    const nuevaCotizacion = result.rows[0];

    console.log(`✅ Cotización #${nuevaCotizacion.id} guardada - ${nombreTrim} - ${modeloTrim}`);

    return res.status(201).json({
      success: true,
      message: 'Cotización enviada exitosamente. Te contactaremos pronto.',
      data: {
        id: nuevaCotizacion.id,
        creado_en: nuevaCotizacion.fecha
      }
    });

  } catch (error) {
    console.error('❌ Error al guardar cotización:', error);

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Error interno del servidor. Intenta nuevamente.';

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// =============================================
// GET /api/cotizaciones - Listar cotizaciones
// =============================================
const listarCotizaciones = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, correo, modelo, mensaje, fecha FROM cotizaciones_rasta ORDER BY fecha DESC'
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener cotizaciones:', error.message);
    next(error);
  }
};

module.exports = {
  crearCotizacion,
  listarCotizaciones
};

