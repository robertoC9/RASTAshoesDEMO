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
    const { nombre, correo, modelo, mensaje } = req.body;

    const result = await db.query(
      `INSERT INTO cotizaciones_rasta (nombre, correo, modelo, mensaje_text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, fecha`,
      [nombre, correo, modelo, mensaje || null]
    );

    const nuevaCotizacion = result.rows[0];

    console.log(`✅ Cotización #${nuevaCotizacion.id} guardada - ${nombre} - ${modelo}`);

    return res.status(201).json({
      success: true,
      message: 'Cotización enviada exitosamente. Te contactaremos pronto.',
      data: {
        id: nuevaCotizacion.id,
        creado_en: nuevaCotizacion.fecha
      }
    });

  } catch (error) {
    console.error('❌ Error al guardar cotización:', error.message);
    next(error); // Pasa al middleware de errores global
  }
};

// =============================================
// GET /api/cotizaciones - Listar cotizaciones
// =============================================
const listarCotizaciones = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, correo, modelo, mensaje_text, fecha FROM cotizaciones_rasta ORDER BY fecha DESC'
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

