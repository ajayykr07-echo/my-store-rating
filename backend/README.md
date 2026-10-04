# 🏪 Store Rating Platform - Backend

![Node.js](https://img.shields.io/badge/Node.js-24-43853D?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-4.x-404D59?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?logo=postgresql)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?logo=supabase)
![Deployed on Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?logo=render)

The robust and scalable REST API backend for the **Store Rating Platform**. Built with Node.js, Express, and PostgreSQL.

## ✨ Features

- **Stateless Authentication:** Secure JWT-based authentication system with encrypted passwords (`bcrypt`).
- **Role-Based Access Control (RBAC):** Middleware-enforced authorization for `admin`, `owner`, and `user` roles.
- **Supabase Integration:** Connects seamlessly to Supabase PostgreSQL using Supavisor (IPv4 connection pooler) for Render compatibility.
- **Comprehensive API:** 
  - Manage users, stores, and ratings.
  - Automatic calculation of aggregate store metrics.
  - Administrative dashboard statistics.

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express](https://expressjs.com/)
- **Database:** PostgreSQL (Hosted on [Supabase](https://supabase.com/))
- **Driver:** `pg` (Node Postgres)
- **Security:** `jsonwebtoken`, `bcrypt`, `cors`
- **Hosting:** [Render](https://render.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed locally
- A PostgreSQL database (e.g., Supabase)

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/ajayykr07-echo/backend.git
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the backend directory:

```env
# Application Port
PORT=3000

# PostgreSQL Connection String (Supabase Pooler Recommended for Render)
DATABASE_URL=postgresql://user:password@aws-0-region.pooler.supabase.com:5432/postgres

# JWT Secret Key
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Database Initialization

A `seed.js` script is provided (if you haven't run it yet) to set up your database schema and create initial testing accounts.

```bash
node seed.js
```

### 4. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start at `http://localhost:3000`.

---

## 📂 Project Structure

```
backend/
├── controllers/       # Route request handlers
│   ├── adminController.js
│   ├── authController.js
│   ├── ownerController.js
│   └── ratingsController.js
├── middleware/        # Express middlewares
│   ├── authMiddleware.js  # Validates JWT tokens
│   └── roleMiddleware.js  # Checks user role privileges
├── models/            # Database query encapsulation
│   ├── ratingModel.js
│   ├── storeModel.js
│   └── userModel.js
├── routes/            # API endpoint definitions
├── db.js              # PostgreSQL pool & auto-IPv4 conversion logic
├── env.js             # Environment variable validator
├── server.js          # Express app entry point
└── seed.js            # Database schema & initial data seeder
```

---

## ☁️ Deployment Notes (Render)

This backend is optimized for Render deployments:
- **IPv4 Compatibility:** Render's free tier lacks outbound IPv6. This app automatically converts direct Supabase URLs to their IPv4 Supavisor equivalents at runtime in `db.js`.
- **SSL Configuration:** SSL is automatically enabled when connecting to remote databases (Supabase/Render).

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
