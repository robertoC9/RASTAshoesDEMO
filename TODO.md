# TODO - Reestructuración de db.js

## ✅ Completado

- [x] Leer y entender archivos existentes (db.js, server.js, controllers, routes)
- [x] Obtener aprobación del plan
- [x] Editar `db.js`:
  - [x] Eliminar toda lógica de desarrollo local (variables PGHOST, PGPORT, etc.)
  - [x] Eliminar detección de entorno `isProduction`
  - [x] Configurar Pool solo con `DATABASE_URL` + `ssl: { rejectUnauthorized: false }`
  - [x] Agregar validación: si `DATABASE_URL` no existe, mostrar error y salir
  - [x] Simplificar `checkConnection()` con `SELECT NOW()`
  - [x] Exportar: `{ pool, query, checkConnection, testConnection }` (compatible con server.js)
- [x] Verificar que `server.js` importa correctamente desde el nuevo `db.js`
- [x] Probar que la app inicia sin errores (verificación de compatibilidad)

