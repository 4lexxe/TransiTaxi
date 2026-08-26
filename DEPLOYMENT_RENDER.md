# Guía de Despliegue Unificado en Render - TransiTaxi

Esta guía explica cómo desplegar **TransiTaxi** como **un solo servicio completo (Frontend + Backend juntos)** en Render, junto con la base de datos MongoDB Atlas.

---

## 🗄️ 1. Base de Datos MongoDB (Atlas)

Render **no hospeda MongoDB de forma nativa** (en su plan gratuito solo hospeda PostgreSQL). Por ello, el estándar utilizado en producción es conectar el servicio a **MongoDB Atlas** (servidor gratuito en la nube de MongoDB):

1. Registrate gratis en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crea un Cluster gratuito **M0**.
3. En **Database Access**, crea un usuario y contraseña.
4. En **Network Access**, agrega la IP `0.0.0.0/0` (permitir acceso desde Render).
5. Haz clic en **Connect** -> **Drivers** y copia tu URI de conexión:
   `mongodb+srv://usuario:password@cluster.mongodb.net/quickRide?retryWrites=true&w=majority`

---

## 🚀 2. Despliegue Unificado en Render (Un solo clic / servicio)

El proyecto ahora está preparado como una **aplicación monolítica unificada**: el servidor Node.js compila y sirve el Frontend de React y las APIs del Backend en el mismo puerto y la misma URL.

### Pasos en Render:

1. Ve a tu [Render Dashboard](https://dashboard.render.com/).
2. Haz clic en **New +** -> **Web Service** (o **Blueprint**).
3. Conecta tu repositorio: **`4lexxe/TransiTaxi`**.
4. Si creas un **Web Service**:
   - **Name**: `transitaxi-app`
   - **Runtime**: `Node` (o `Docker`, ¡ambos funcionan ahora!)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. En **Environment Variables**, agrega:
   * **`MONGODB_PROD_URL`**: Tu URI de MongoDB Atlas (`mongodb+srv://...`).
   * **`ENVIRONMENT`**: `production`
   * **`JWT_SECRET`**: `un_secreto_seguro_cualquiera`
6. Haz clic en **Create Web Service**.

---

## 🔑 3. Poblar Base de Datos de Producción con Usuarios Demo

Una vez creado el servicio en Render y conectada tu DB de MongoDB Atlas, ejecuta este comando en tu terminal local para sembrar los usuarios de prueba en la nube:

```bash
cd Backend
MONGODB_PROD_URL="tu_uri_de_mongodb_atlas" ENVIRONMENT=production npm run seed
```

### Credenciales Demo Creadas:
* 👤 **Pasajero**: `usuario@demo.com` / `Password123!`
* 🚖 **Conductor**: `conductor@demo.com` / `Password123!`
