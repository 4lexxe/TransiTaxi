# Guía de Despliegue en Render - QuickRide

Esta guía explica paso a paso cómo desplegar la aplicación **QuickRide** en [Render](https://render.com/).

---

## 🗄️ 1. Preparar la Base de Datos MongoDB (Atlas)

Render requiere una base de datos hospedada en la nube para el Backend en producción.

1. Crea una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crea un Cluster gratuito (M0).
3. En la sección **Database Access**, crea un usuario con contraseña.
4. En **Network Access**, agrega la IP `0.0.0.0/0` (permitir acceso desde cualquier lugar para Render).
5. En **Database**, haz clic en **Connect** -> **Drivers** y copia la cadena de conexión (`mongodb+srv://...`).

---

## 🚀 2. Opción A: Despliegue Automático con Blueprint (`render.yaml`)

QuickRide incluye un archivo `render.yaml` preconfigurado.

1. Sube tu código a un repositorio de **GitHub** o **GitLab**.
2. Ingresa a tu panel de [Render Dashboard](https://dashboard.render.com/).
3. Haz clic en **New +** -> **Blueprint**.
4. Conecta tu repositorio de QuickRide.
5. Render detectará el archivo `render.yaml` y creará automáticamente los 2 servicios:
   - **`quickride-backend`** (Web Service Node.js)
   - **`quickride-frontend`** (Static Site React)
6. Completa las variables de entorno cuando Render te lo solicite:
   - En `quickride-backend`: asigna `MONGODB_PROD_URL` con tu URL de MongoDB Atlas.
   - En `quickride-frontend`: asigna `VITE_SERVER_URL` con la URL asignada a tu backend (`https://quickride-backend.onrender.com`).
   - En `quickride-backend`: asigna `CLIENT_URL` con la URL asignada a tu frontend (`https://quickride-frontend.onrender.com`).
7. Haz clic en **Apply**.

---

## 🛠️ 3. Opción B: Despliegue Manual Servicio por Servicio

### A. Desplegar Backend (Web Service)
1. En Render Dashboard, haz clic en **New +** -> **Web Service**.
2. Conecta tu repositorio.
3. Configura los parámetros:
   - **Name**: `quickride-backend`
   - **Root Directory**: *(dejar vacío)*
   - **Environment**: `Node`
   - **Build Command**: `cd Backend && npm install`
   - **Start Command**: `cd Backend && npm start`
4. En **Environment Variables**, agrega:
   - `PORT`: `10000`
   - `ENVIRONMENT`: `production`
   - `MONGODB_PROD_URL`: *(Tu URL de MongoDB Atlas)*
   - `JWT_SECRET`: *(Un secreto aleatorio seguro)*
   - `CLIENT_URL`: *(La URL de tu frontend en Render)*
   - `ALLOW_PUBLIC_MAP_PROVIDERS`: `true`

### B. Desplegar Frontend (Static Site)
1. En Render Dashboard, haz clic en **New +** -> **Static Site**.
2. Conecta tu repositorio.
3. Configura los parámetros:
   - **Name**: `quickride-frontend`
   - **Build Command**: `cd Frontend && npm install && npm run build`
   - **Publish Directory**: `Frontend/dist`
4. En **Redirects / Rewrites**, añade una regla para Single Page Applications (SPA):
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. En **Environment Variables**, agrega:
   - `VITE_SERVER_URL`: `https://tu-backend.onrender.com`
   - `VITE_ENVIRONMENT`: `production`
   - `VITE_RIDE_TIMEOUT`: `90000`

---

## 🔑 4. Cuentas Demo de Prueba

Para demostrar la aplicación una vez desplegada, puedes ejecutar el script de seed para sembrar la base de datos de producción:

```bash
cd Backend
MONGODB_PROD_URL="tu_mongodb_atlas_url" ENVIRONMENT=production npm run seed
```

### Credenciales creadas:

* 👤 **Pasajero (Rider)**:
  * **Email**: `usuario@demo.com`
  * **Contraseña**: `Password123!`

* 🚖 **Conductor (Captain)**:
  * **Email**: `conductor@demo.com`
  * **Contraseña**: `Password123!`
  * **Vehículo**: Auto verde (`ABC-123`)
