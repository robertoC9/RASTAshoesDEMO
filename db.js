/**
 * =============================================
 * db.js - Conexión a PostgreSQL
 * Zapatillas RASTA
 * =============================================
 * Compatible con Render + pgAdmin:
 *  - Usa DATABASE_URL con SSL (producción)
 *  - Fallback local con PGUSER/PGPASSWORD/PGHOST/PGPORT/PGDATABASE (desarrollo)
 * =============================================
 *
 * NOTA: dotenv se carga desde server.js (entry point).
 * No es necesario require('dotenv') aquí.
 */

const { Pool } = require('pg');

// =============================================
// CONFIGURACIÓN DEL POOL
// =============================================
const poolConfig = {
  connectionString: process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || '127.0.0.1'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'zapatillas_rasta'}`
};

// SSL solo en producción o si se fuerza con DB_SSL
const useSsl = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

if (useSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

// LOG de la configuración (sin mostrar password)
const logConfig = { ...poolConfig };
if (logConfig.connectionString) {
  logConfig.connectionString = logConfig.connectionString.replace(/:([^:@]+)@/, ':****@');
}
console.log('🗄️  Configuración DB:', JSON.stringify(logConfig, null, 2));
console.log(`🔒 SSL: ${useSsl ? 'activado' : 'desactivado'}`);

const pool = new Pool(poolConfig);

// =============================================
// MANEJADOR DE ERRORES DEL POOL
// =============================================
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
});

// =============================================
// FUNCIONES DE CONSULTA
// =============================================

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

/**
 * Prueba la conexión a la base de datos
 * @returns {Promise<boolean>} - true si la conexión es exitosa
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Conexión DB exitosa - Hora servidor: ${result.rows[0].current_time}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('   Detalles:', error.stack);
    }
    return false;
  }
};

module.exports = {
  query,
  getClient,
  testConnection,
  pool
};

