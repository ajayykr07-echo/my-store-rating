# 🏪 Store Rating Platform - Frontend

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Netlify](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?logo=netlify)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, fast, and responsive frontend interface for the **Store Rating Platform**. Built with React 19 and Vite, this application allows users to discover local stores, submit ratings, and enables store owners to manage their business profiles.

## ✨ Features

- **Role-Based Dashboards:** 
  - **System Admins:** Manage all users and stores across the platform.
  - **Store Owners:** View overall ratings and detailed feedback for their assigned stores.
  - **Normal Users:** Submit, edit, and view store ratings.
- **🌗 Dark Mode:** Complete dark mode support with automatic persistence using local storage.
- **⚡ Fast & Optimized:** Bundled with Vite for instant server starts and lightning-fast HMR.
- **📱 Responsive UI:** Clean, mobile-friendly interface mimicking a Tailwind-style design system.
- **🔒 Secure Authentication:** JWT-based stateless authentication flow with auto-logout on expiration.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Bundler:** [Vite 8](https://vitejs.dev/)
- **Styling:** Custom CSS Variables & CSS-in-JS patterns
- **Deployment:** [Netlify](https://www.netlify.com/) (Configured for SPA routing)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/ajayykr07-echo/frontend.git
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the frontend directory and configure your backend URL:

```env
# Local Development
VITE_API_URL=http://localhost:3000/api

# Production (Render)
# VITE_API_URL=https://your-backend-url.onrender.com/api
```

### 3. Development Server

Start the Vite development server:

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`.

### 4. Build for Production

To create a production-ready build:

```bash
npm run build
```

The optimized files will be output to the `dist/` directory.

---

## 📂 Project Structure

```
frontend/
├── public/               # Static assets & Netlify configs
│   ├── _redirects        # SPA routing fallback
│   └── _headers          # MIME type configurations
├── src/
│   ├── components/       # Reusable React components & Views
│   │   ├── AdminView.jsx
│   │   ├── AuthView.jsx
│   │   ├── Navbar.jsx
│   │   ├── OwnerView.jsx
│   │   ├── UserView.jsx
│   │   └── StarRating.jsx
│   ├── utils/            # Helper functions
│   │   └── validators.js # Form validation logic
│   ├── api.js            # Centralized API service & fetch wrapper
│   ├── config.js         # Environment configuration
│   ├── App.jsx           # Main application routing and state
│   ├── index.css         # Global styles and Dark Mode variables
│   └── main.jsx          # React DOM entry point
├── index.html            # App HTML shell
├── netlify.toml          # Netlify build configuration
└── vite.config.js        # Vite bundler configuration
```

---

## 🎨 Theme System

The app utilizes a centralized CSS variable system for theming. To modify colors, edit the `:root` and `.dark` variables in `src/index.css`.

Toggle between Light and Dark mode using the button in the application Navbar. Your preference is automatically saved to your browser!

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
