/**
 * =============================================
 * init_db.js - Script para inicializar la DB
 * Zapatillas RASTA
 * =============================================
 * Uso: node init_db.js
 */

const db = require('./db');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('🔄 Inicializando base de datos...');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'init_db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Ejecutar el SQL
    await db.query(sql);

    console.log('✅ Tabla "cotizaciones" creada/verificada exitosamente.');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
  } finally {
    await db.pool.end();
    console.log('🔌 Conexión cerrada.');
  }
}

initDatabase();

