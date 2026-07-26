/**
 * =============================================
 * db.js - Conexión a PostgreSQL (Pool reutilizable)
 * Zapatillas RASTA - Sistema de Cotización
 * =============================================
 *
 * Configuración inteligente según entorno:
 *  - Producción (Render)  → usa DATABASE_URL + SSL
 *  - Desarrollo (local)   → usa variables PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
 *
 * dotenv se carga desde server.js (entry point), no es necesario require('dotenv') aquí.
 * =============================================
 */

const { Pool } = require('pg');

// =============================================
// 1. DETECCIÓN DEL ENTORNO
// =============================================
const isProduction = process.env.NODE_ENV === 'production';

// =============================================
// 2. CONFIGURACIÓN DEL POOL SEGÚN ENTORNO
// =============================================

/**
 * En producción (Render):
 *  - Se usa obligatoriamente DATABASE_URL (provista por Render)
 *  - Se activa SSL con rejectUnauthorized: false (requerido por Render)
 *  - Se evita cualquier intento de conexión a 127.0.0.1
 *
 * En desarrollo (local):
 *  - Se construye la URL desde variables individuales:
 *    PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
 *  - Si falta alguna, se usan valores por defecto
 *  - SSL desactivado (la base local no lo requiere)
 */
const poolConfig = {};

if (isProduction) {
  // ── Modo Producción ──────────────────────────────────
  if (!process.env.DATABASE_URL) {
    console.error('❌ FATAL: DATABASE_URL no está definida en entorno de producción.');
    console.error('   Render inyecta esta variable automáticamente al vincular PostgreSQL.');
    process.exit(1);
  }

  poolConfig.connectionString = process.env.DATABASE_URL;
  poolConfig.ssl = { rejectUnauthorized: false };

  console.log('🌐 Entorno: PRODUCCIÓN (Render)');
  console.log('🔒 SSL activado con rejectUnauthorized: false');
} else {
  // ── Modo Desarrollo ──────────────────────────────────
  const host     = process.env.PGHOST     || 'localhost';
  const port     = process.env.PGPORT     || 5434;
  const user     = process.env.PGUSER     || 'postgres';
  const password = process.env.PGPASSWORD || '';
  const database = process.env.PGDATABASE || 'zapatillas_rasta';

  poolConfig.connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;

  // SSL solo si se fuerza explícitamente con DB_SSL=true (útil para pruebas)
  if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  console.log('🌐 Entorno: DESARROLLO (local)');
  console.log(`   Host: ${host}:${port}`);
  console.log(`   DB:   ${database}`);
  console.log(`   User: ${user}`);
  console.log(`   SSL:  ${poolConfig.ssl ? 'activado' : 'desactivado'}`);
}

// =============================================
// 3. CREACIÓN DEL POOL EXPORTABLE
// =============================================
const pool = new Pool(poolConfig);

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
 * Comportamiento según entorno:
 *  - Producción  → muestra "DB OK (producción)"
 *  - Desarrollo  → muestra "DB OK (desarrollo)"
 *
 * @returns {Promise<boolean>} true si la conexión fue exitosa, false en caso contrario
 */
const checkConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT NOW()');

    if (isProduction) {
      console.log('✅ DB OK (producción)');
    } else {
      console.log('✅ DB OK (desarrollo)');
    }

    return true;
  } catch (error) {
    // ── Manejo específico de errores comunes ──────────
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error de conexión: servidor PostgreSQL rehusó la conexión (ECONNREFUSED).');
      console.error('   Asegúrate de que PostgreSQL esté corriendo y aceptando conexiones en:');
      if (isProduction) {
        console.error('   Render: verifica que DATABASE_URL sea correcta y que la IP esté permitida.');
      } else {
        console.error(`   Host: ${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}`);
        console.error('   Comando útil: pg_isready');
      }
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ Error de conexión: tiempo de espera agotado (ETIMEDOUT).');
      console.error('   Verifica la conectividad de red y el firewall.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ Error de conexión: el host no fue encontrado (ENOTFOUND).');
      console.error(`   Host especificado: ${process.env.PGHOST || 'localhost'}`);
    } else {
      console.error('❌ Error de conexión a PostgreSQL:', error.message);
    }

    // En desarrollo, mostrar stack trace para depuración
    if (!isProduction) {
      console.error('   Detalles:', error.stack);
    }

    return false;
  } finally {
    // Liberar el cliente si se obtuvo
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        // Ignorar errores al liberar (el cliente pudo ya estar liberado)
      }
    }
  }
};

// =============================================
// 6. FUNCIONES AUXILIARES PARA CONSULTAS
// =============================================

/**
 * Ejecuta una consulta SQL simple
 * @param {string} text - Consulta SQL con placeholders ($1, $2, ...)
 * @param {Array} [params] - Valores para los placeholders
 * @returns {Promise<QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Obtiene un cliente del pool (para transacciones)
 * @returns {Promise<PoolClient>}
 */
const getClient = () => pool.connect();

// =============================================
// 7. ALIAS DE RETROCOMPATIBILIDAD
// =============================================
// server.js y otros módulos pueden estar importando testConnection
const testConnection = checkConnection;

// =============================================
// 8. EXPORTACIONES
// =============================================
module.exports = {
  pool,              // Pool reutilizable de PostgreSQL
  query,             // Función para consultas simples
  getClient,         // Función para obtener un cliente (transacciones)
  checkConnection,   // Verifica el estado de la conexión
  testConnection     // Alias de checkConnection (retrocompatibilidad)
};

