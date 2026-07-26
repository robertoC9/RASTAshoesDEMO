/**
 * =============================================
 * middleware/validation.js - Validación de formularios
 * Zapatillas RASTA
 * =============================================
 * Usa express-validator para validar datos entrantes
 * =============================================
 */

const { body, validationResult } = require('express-validator');

// =============================================
// REGLAS DE VALIDACIÓN PARA COTIZACIÓN
// =============================================
const cotizacionRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),

  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El formato del correo no es válido.')
    .normalizeEmail(),

  body('modelo')
    .trim()
    .notEmpty().withMessage('El modelo es obligatorio.')
    .isLength({ max: 100 }).withMessage('El modelo no puede exceder 100 caracteres.'),

  body('mensaje')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage('El mensaje no puede exceder 500 caracteres.')
];

// =============================================
// MIDDLEWARE - Verificar resultados
// =============================================
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => e.msg)
    });
  }
  next();
};

module.exports = {
  cotizacionRules,
  validate
};

