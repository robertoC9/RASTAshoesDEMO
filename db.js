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

const poolConfig = {
  connectionString: process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || '127.0.0.1'}:${process.env.PGPORT || 5434}/${process.env.PGDATABASE || 'zapatillas_rasta'}`
};

const useSsl = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

if (useSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

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

