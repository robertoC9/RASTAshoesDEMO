# TODO - Zapatillas RASTA - Correcciones

## ✅ Completado

### 1. Creación de `.env` con credenciales locales
- ✅ Archivo `.env` creado con:
  - `PGUSER=postgres`
  - `PGPASSWORD=16081976`
  - `PGHOST=127.0.0.1`
  - `PGPORT=5434`
  - `PGDATABASE=zapatillas_rasta`
  - `NODE_ENV=development` (para ver errores reales)

### 2. Mejora de `db.js`
- ✅ Se agregó `testConnection()` que verifica la conexión a PostgreSQL
- ✅ Se agregó `pool.on('error')` para manejar errores inesperados del pool
- ✅ Mejor logging de la configuración (sin mostrar password)
- ✅ SSL condicional según entorno

### 3. Mejora de `server.js`
- ✅ `startServer()` asíncrono que prueba DB antes de iniciar
- ✅ `/api/health` mejorado: ahora muestra estado de la DB (`connected`/`disconnected`)
- ✅ **Graceful shutdown**: cierra el pool de PostgreSQL en SIGTERM/SIGINT
- ✅ Error handler: muestra errores reales en desarrollo (`NODE_ENV` no definido también es dev)

### 4. Mejora de `controllers/cotizacionController.js`
- ✅ `crearCotizacion`: muestra error real cuando `NODE_ENV` es `development` o no está definido
- ✅ `listarCotizaciones`: ahora maneja errores con `res.status(500)` en vez de `next(error)` (consistente)

### 5. Pruebas
- ✅ Servidor inicia correctamente en puerto 3000
- ✅ Conexión a PostgreSQL exitosa (localhost:5434)
- ✅ POST /api/cotizacion → 201 ✅ (Cotización #7 creada)
- ✅ GET /api/cotizaciones → 200 ✅ (7 registros)
- ✅ GET /api/health → 200 ✅ (DB: connected)

## 📝 Pendiente para Render

### Configurar en Render Dashboard
- [ ] Verificar que `DATABASE_URL` use la **Internal Database URL** de Render
- [ ] Verificar que `NODE_ENV=production` esté seteado en Render
- [ ] Ejecutar `init_db.sql` en la DB de Render (vía SQL Shell o `npm run init-db`)
- [ ] Probar POST /api/cotizacion desde el frontend en Render

