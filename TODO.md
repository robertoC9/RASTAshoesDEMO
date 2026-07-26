# 🚀 Plan de Despliegue - Zapatillas RASTA a Render

## ✅ Tareas Completadas (Código)

- [x] Crear estructura /public para archivos estáticos
- [x] Mover archivos estáticos a /public
- [x] Actualizar db.js - Conexión PostgreSQL con DATABASE_URL y SSL
- [x] Actualizar server.js - Servir desde /public y optimizar
- [x] Actualizar init_db.sql con estructura de columnas correcta
- [x] Actualizar cotizacionController.js con columna mensaje
- [x] Crear .env.example con variables documentadas
- [x] Verificar package.json con scripts correctos

## 🔜 Pasos Manuales en Render

- [ ] Subir proyecto a GitHub (`git init`, `git add .`, `git commit -m "v2.0"`, `git push`)
- [ ] Crear Web Service en Render
- [ ] Configurar Base de Datos PostgreSQL en Render
- [ ] Agregar variables de entorno en Render
- [ ] Ejecutar init_db.sql en consola SQL de Render
- [ ] Probar rutas de la aplicación

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Preparación para Render - v2.0"
git remote add origin https://github.com/TU-USUARIO/zapatillas-rasta.git
git branch -M main
git push -u origin main
```

### 2. Crear Web Service en Render
- Ir a https://dashboard.render.com
- New + → Web Service
- Conectar repositorio de GitHub
- Configurar:
  - **Name**: `zapatillas-rasta`
  - **Region**: (la más cercana)
  - **Branch**: `main`
  - **Root Directory**: (vacío - raíz del proyecto)
  - **Runtime**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `node server.js`
  - **Plan**: Free

### 3. Crear Base de Datos PostgreSQL en Render
- Dashboard → New + → PostgreSQL
- Configurar:
  - **Name**: `zapatillas-rasta-db`
  - **Database**: `zapatillas_rasta`
  - **User**: `postgres`
  - **Plan**: Free
- Una vez creada, copiar la **Internal Database URL**

### 4. Variables de Entorno en Render
En el Web Service → Environment:
| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(Internal Database URL de Render)* |
| `CORS_ORIGINS` | `https://zapatillas-rasta.onrender.com` |

### 5. Ejecutar SQL en la Base de Datos
En Render, ir a la DB → **SQL Runner** o **PSQL Console** y ejecutar:
```sql
CREATE TABLE IF NOT EXISTS cotizaciones_rasta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120),
    correo VARCHAR(120),
    modelo VARCHAR(80),
    mensaje TEXT,
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_rasta_correo ON cotizaciones_rasta(correo);
```

### 6. Probar la Aplicación
- Abrir `https://zapatillas-rasta.onrender.com`
- Probar ruta health: `https://zapatillas-rasta.onrender.com/api/health`
- Probar envío de cotización desde el formulario

