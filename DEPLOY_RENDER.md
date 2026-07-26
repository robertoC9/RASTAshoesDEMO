# 🚀 Guía de Despliegue - Zapatillas RASTA en Render

## 📋 Requisitos Previos

| Recurso | Estado |
|---------|--------|
| Cuenta en [Render.com](https://render.com) (GitHub login) | ✅ |
| Proyecto subido a GitHub | ✅ |
| Node.js 18+ local (opcional para pruebas) | ✅ |

---

## 📦 1. Subir el Proyecto a GitHub

```bash
# Desde la carpeta del proyecto:
git init
git add .
git commit -m "🚀 Zapatillas RASTA - Listo para Render"
git remote add origin https://github.com/TU_USUARIO/zapatillas-rasta.git
git branch -M main
git push -u origin main
```

> ⚠️ **IMPORTANTE**: No subir `.env` — ya está en `.gitignore`.

---

## 🌐 2. Crear Web Service en Render

### Opción A: Usando Blueprint (recomendado)

1. Ir a [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Conectar tu repositorio de GitHub
4. Render detectará automáticamente `render.yaml`
5. Click **"Apply"**
6. ¡Listo! Render crea el Web Service + PostgreSQL automáticamente

### Opción B: Manual paso a paso

1. Ir a [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Conectar tu repositorio de GitHub
4. Configurar:

   | Campo | Valor |
   |-------|-------|
   | **Name** | `zapatillas-rasta` |
   | **Region** | `Oregon (US)` o la más cercana |
   | **Branch** | `main` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | `Free` |

5. Click **"Create Web Service"**

---

## 🗄️ 3. Crear Base de Datos PostgreSQL

1. En Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configurar:

   | Campo | Valor |
   |-------|-------|
   | **Name** | `zapatillas-rasta-db` |
   | **Database** | `zapatillas_rasta` |
   | **User** | Dejar por defecto |
   | **Region** | Misma que el Web Service |
   | **Plan** | `Free` |

3. Click **"Create Database"**
4. Esperar a que se cree (1-2 minutos)
5. Copiar el campo **"Internal Database URL"** (lo usaremos abajo)

---

## 🔐 4. Configurar Variables de Entorno

1. Ir a tu Web Service en Render
2. Ir a **"Environment"** → **"Environment Variables"**
3. Agregar:

   | Variable | Valor |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | *(pegar Internal Database URL de PostgreSQL)* |
   | `CORS_ORIGINS` | `https://zapatillas-rasta.onrender.com,http://localhost:3000` |

4. Click **"Save Changes"**
5. El servicio se reiniciará automáticamente

---

## 📊 5. Inicializar la Tabla en la Base de Datos

### Opción A: Usando la consola SQL de Render

1. Ir a tu PostgreSQL en Render Dashboard
2. Click en **"Connect"** → **"SQL Shell (psql)"**
3. Se abrirá una terminal web
4. Ejecutar:

```sql
CREATE TABLE IF NOT EXISTS cotizaciones_rasta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120),
    correo VARCHAR(120),
    modelo VARCHAR(80),
    mensaje TEXT,
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_rasta_correo
    ON cotizaciones_rasta(correo);
```

### Opción B: Usando el script init_db.js en local

```bash
# Asegúrate de tener DATABASE_URL de Render en tu .env local
# Luego ejecuta:
npm run init-db
```

---

## ✅ 6. Probar el Despliegue

Una vez que el servicio esté **"Live"** (status verde), probar:

### Rutas Públicas

| Ruta | Método | URL | Resultado Esperado |
|------|--------|-----|--------------------|
| Home | `GET` | `https://zapatillas-rasta.onrender.com/` | ✅ Página HTML |
| Salud | `GET` | `https://zapatillas-rasta.onrender.com/api/health` | ✅ JSON con status ok |
| Cotizaciones | `GET` | `https://zapatillas-rasta.onrender.com/api/cotizaciones` | ✅ JSON (vacío al inicio) |
| Crear cotización | `POST` | `https://zapatillas-rasta.onrender.com/api/cotizacion` | ✅ JSON con éxito |

### Ejemplo con curl

```bash
# Health check
curl https://zapatillas-rasta.onrender.com/api/health

# Crear cotización (POST)
curl -X POST https://zapatillas-rasta.onrender.com/api/cotizacion \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","correo":"juan@email.com","modelo":"RASTA Clásico","mensaje":"Quiero personalizar"}'

# Listar cotizaciones
curl https://zapatillas-rasta.onrender.com/api/cotizaciones
```

---

## 🔄 7. Redeploy Automático

Render se reconecta automáticamente con GitHub en la rama `main`:

```bash
git add .
git commit -m "fix: corrección en validación"
git push origin main
# Render redeploy automáticamente en segundos
```

---

## ❓ Troubleshooting

### Error: `ECONNREFUSED` en la base de datos

```
Solución: Verificar que DATABASE_URL sea la "Internal Database URL"
(no la "External"). La Internal funciona dentro de la red de Render.
```

### Error: `CORS` bloquea peticiones

```
Solución: Agregar el dominio exacto (con https://) en CORS_ORIGINS.
```

### Error: `Cannot GET /`

```
Solución: Verificar que /public/index.html existe y que express.static
está configurado correctamente.
```

### Logs en Render

1. Ir a tu Web Service en Render Dashboard
2. Click en **"Logs"** (barra lateral izquierda)
3. Revisar errores de la app en tiempo real

---

## 📁 Estructura Final del Proyecto

```
zapatillas/
├── public/                  # Archivos estáticos (HTML, CSS, JS, imágenes)
│   ├── index.html           # Página principal
│   ├── coleccion.html       # Página de colección
│   ├── style.css            # Estilos principales
│   ├── style-coleccion.css  # Estilos de colección
│   ├── script.js            # Lógica frontend
│   ├── script-coleccion.js  # Lógica frontend colección
│   ├── logo.svg             # Logo
│   ├── favicon.svg          # Favicon
│   └── ...                  # Imágenes, audio, etc.
├── controllers/
│   └── cotizacionController.js
├── routes/
│   └── cotizacionRoutes.js
├── middleware/
│   └── validation.js
├── server.js                # Entry point
├── db.js                    # Conexión PostgreSQL
├── package.json
├── render.yaml              # Blueprint Render (auto-deploy)
├── .env.example             # Template de variables de entorno
├── init_db.sql              # SQL de creación de tabla
├── init_db.js               # Script para ejecutar el SQL
├── .gitignore
└── DEPLOY_RENDER.md         # Esta guía
```

---

## 🎯 Resumen de Mejoras Aplicadas

| Mejora | Archivo | Detalle |
|--------|---------|---------|
| ✅ Puerto dinámico | `server.js` | Usa `process.env.PORT` |
| ✅ Archivos estáticos | `server.js` | `express.static('public')` |
| ✅ Ruta principal | `server.js` | `GET /` sirve `index.html` |
| ✅ Conexión PostgreSQL | `db.js` | `DATABASE_URL` + SSL |
| ✅ Variables de entorno | `.env.example` | Documentación |
| ✅ Blueprint Render | `render.yaml` | Infraestructura como código |
| ✅ Guía de despliegue | `DEPLOY_RENDER.md` | Instrucciones paso a paso |
| ✅ Sin dotenv redundante | `db.js` | Se carga desde server.js |
| ✅ Mensaje corregido | `init_db.js` | "cotizaciones_rasta" |

---

**🚀 ¡Proyecto listo para desplegar en Render sin errores!**

