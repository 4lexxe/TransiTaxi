<div align="center">
    <img src="/Frontend//public/logo-quickride-green.png" height="100px" >
</div>

# QuickRide - Full Stack Ride Booking Application

QuickRide is a feature-rich project built using modern web technologies. It replicates the core features and functionalities of the existing ride booking platforms, including **user authentication**, **ride booking**, **real-time location tracking**, **fare calculation** and **real-time communication**. The application features a clean and responsive user interface, ensuring an intuitive user experience. Designed as a learning and portfolio project, it showcases skills in **frontend and backend development, API integration, and real-time features**.


---


## 📚 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Quick Start](#quick-start)
5. [Environment Variables](#environment-variables)
6. [Contributing](#contributing)
7. [License](#license)

---


## ⚙️ Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,js,react,nodejs,express,mongo,tailwind,gcp,npm,vercel,git,gmail,postman&perline=7" />
</p>

| **Category**       | **Technologies / Tools**                                              |
| ------------------ | --------------------------------------------------------------------- |
| **Frontend**       | HTML, CSS, React.js, Tailwind CSS, OpenStreetMap (Leaflet)            |
| **Backend**        | Node.js, Express.js, MongoDB, Socket IO, NodeMailer, Nominatim, OSRM  |
| **Authentication** | JWT (JSON Web Token), bcrypt                                          |
| **Deployment**     | Vercel, Render                                                        |
| **Dev Tools**      | Postman, npm, Nodemon, ESLint, Custom Logger                          |


---


## ✨ Features

### 🔐 Authentication & Authorization

- Secure email/password login with full form validation
- Email verification and logout functionality
- Forgot and change password support
- Role-based access control (User and Captain)
- Session handling and route protection (unauthorized access is blocked)

- ### 🧑🏻 User Management

- Edit personal profile details (name, email, phone)
- Ride history tracking
- Form validation for all user inputs

### 📍 Location & Mapping

- Pickup and destination selection with address auto-complete
- Real-time location tracking on interactive maps
- Route visualization with distance and estimated time calculation

- ### 🚖 Ride Booking System

- Supports multiple ride types: Car, Bike, and Auto
- Live ride status updates: Pending, Accepted, Ongoing, Completed, Cancelled
- Concurrency control: A ride request can only be accepted by one captain
- Automatic ride cancellation after timeout
- Accurate fare estimation based on distance and time

### 🔄 Real-Time Updates

- Socket-based updates for ride status and live locations
- Real-time in-app chat between rider and captain
- Chat messages are stored in the database with timestamps
- Access control ensures only assigned rider and captain can view the conversation


### 👨‍✈️ Captain (Driver) Interface

- Accept or reject incoming ride requests
- Real-time updates for trip progress
- Role-specific access to ride-related actions

### 🧰 System Utilities

- Custom logger to persist frontend and backend logs in the database
- Force reset feature to clear all local app data and recover from unstable states
- Popup alert system for immediate feedback (success, error, warning)

---


## ⚡ Quick Start

### 📁 Project Structure

```

📂 Backend      // Node.js + Express server
📂 Frontend     // React.js application

```

### 1. Clone the Repository

```bash
git clone 
cd QuickRide
```

### 2. Install Dependencies

#### Frontend

```bash
cd Frontend
npm install
```

#### Backend

```bash
cd ../Backend
npm install
```

### 3. Run the Application

#### Frontend (React + Vite)

```bash
npm run dev
```

#### Backend (Node.js + Express)

```bash
npm run dev
```

### 4. Open the App

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Environment Variables

Create `.env` files in both `Frontend/` and `Backend/` directories.
`.env.example` files are already present in the folders.

### Frontend `.env`

```env
VITE_SERVER_URL=http://localhost:3000
VITE_ENVIRONMENT=development
VITE_RIDE_TIMEOUT=90000
```

### Backend `.env`

```env
PORT=3000
RELOAD_INTERVAL=10
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
ENVIRONMENT=development
MONGODB_PROD_URL=<your-mongodb-atlas-url>
MONGODB_DEV_URL=mongodb://127.0.0.1:27017/quickRide
JWT_SECRET=<your-jwt-secret>
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
OSRM_BASE_URL=https://router.project-osrm.org
MAP_CACHE_TTL_MS=300000
MAP_CACHE_MAX_ENTRIES=500
ALLOW_PUBLIC_MAP_PROVIDERS=false
MAIL_USER=<your-gmail-id>
MAIL_PASS=<your-app-password>
```

---

## 🤝 Contributing

We welcome community contributions! To contribute:

1. Star this repository
2. Fork this repository
3. Create a new branch (`git checkout -b feature/YourFeature`)
4. Commit your changes (`git commit -m 'Add your feature description...'`)
5. Push to the branch (`git push origin feature/YourFeature`)
6. Create a Pull Request

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

**Ready to contribute? Let’s build something amazing together.**
