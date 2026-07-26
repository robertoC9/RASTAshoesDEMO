-- =============================================
-- init_db.sql - Crear tabla de cotizaciones
-- Zapatillas RASTA
-- =============================================
-- Ejecutar con: psql -U postgres -d zapatillas_rasta -f init_db.sql

CREATE TABLE IF NOT EXISTS cotizaciones_rasta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120),
    correo VARCHAR(120),
    modelo VARCHAR(80),
    mensaje_text VARCHAR(120),
    fecha TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas por correo
CREATE INDEX IF NOT EXISTS idx_cotizaciones_rasta_correo ON cotizaciones_rasta(correo);

