/**
 * =============================================
 * db.js - Conexión a PostgreSQL
 * Zapatillas RASTA
 * =============================================
 * Compatible con Render:
 *  - Usa DATABASE_URL con SSL
 *  - Fallback local para desarrollo
 * =============================================
 *
 * NOTA: dotenv se carga desde server.js (entry point).
 * No es necesario require('dotenv') aquí.
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }  // SSL requerido por Render
    : false                          // Sin SSL en desarrollo local
});

/**
 * Ejecuta una consulta SQL
 * @param {string} text - Consulta SQL con placeholders ($1, $2, ...)
 * @param {Array} [params] - Valores para los placeholders
 * @returns {Promise<QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Obtiene un cliente del pool para transacciones
 * @returns {Promise<PoolClient>}
 */
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool
};

