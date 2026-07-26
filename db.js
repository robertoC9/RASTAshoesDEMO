/**
 * =============================================
 * db.js - Conexión a PostgreSQL (Pool reutilizable)
 * Zapatillas RASTA - Sistema de Cotización
 * =============================================
 *
 * Configuración exclusiva para Render (producción):
 *  - Usa únicamente DATABASE_URL (provista por Render)
 *  - SSL obligatorio con rejectUnauthorized: false
 *
 * dotenv se carga desde server.js (entry point), no es necesario require('dotenv') aquí.
 * =============================================
 */

const { Pool } = require('pg');

// =============================================
// 1. VALIDACIÓN DE DATABASE_URL
// =============================================
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL no está definida.');
  console.error('   Render inyecta esta variable automáticamente al vincular PostgreSQL.');
  console.error('   En desarrollo local, crea un archivo .env con:');
  console.error('   DATABASE_URL=postgresql://usuario:password@host:puerto/base_de_datos');
  process.exit(1);
}

// =============================================
// 2. CONFIGURACIÓN DEL POOL
// =============================================
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

// =============================================
// 3. CREACIÓN DEL POOL EXPORTABLE
// =============================================
const pool = new Pool(poolConfig);

console.log('🔌 Pool de PostgreSQL configurado con DATABASE_URL');
console.log('🔒 SSL activado con rejectUnauthorized: false');

// =============================================
// 4. MANEJADOR DE ERRORES DEL POOL
// =============================================
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
});

// =============================================
// 5. FUNCIÓN checkConnection()
// =============================================

/**
 * Verifica la conexión a la base de datos ejecutando SELECT NOW()
 *
 * @returns {Promise<boolean>} true si la conexión fue exitosa, false en caso contrario
 */
const checkConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ Conexión a PostgreSQL exitosa — ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('   El servidor PostgreSQL rehusó la conexión (ECONNREFUSED).');
      console.error('   Verifica que DATABASE_URL sea correcta y que la IP esté permitida en Render.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   Tiempo de espera agotado (ETIMEDOUT). Verifica conectividad de red y firewall.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   El host no fue encontrado (ENOTFOUND). Verifica la URL de conexión.');
    } else if (error.code === '28P01') {
      console.error('   Autenticación fallida (28P01). Verifica el usuario y contraseña en DATABASE_URL.');
    }

    return false;
  } finally {
    if (client) {
      try {
        client.release();
      } catch (_) {
        // Ignorar errores al liberar el cliente
      }
    }
  }
};

// =============================================
// 6. FUNCIÓN AUXILIAR PARA CONSULTAS
// =============================================

/**
 * Ejecuta una consulta SQL simple
 * @param {string} text - Consulta SQL con placeholders ($1, $2, ...)
 * @param {Array} [params] - Valores para los placeholders
 * @returns {Promise<QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

// =============================================
// 7. ALIAS DE RETROCOMPATIBILIDAD
// =============================================
const testConnection = checkConnection;

// =============================================
// 8. EXPORTACIONES
// =============================================
module.exports = {
  pool,              // Pool reutilizable de PostgreSQL
  query,             // Función para consultas simples (text, params) => pool.query(text, params)
  checkConnection,   // Verifica el estado de la conexión ejecutando SELECT NOW()
  testConnection     // Alias de checkConnection (retrocompatibilidad con server.js)
};

