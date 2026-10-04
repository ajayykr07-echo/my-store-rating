import "./App.css";
import { useState, useEffect } from "react";
import { setOnUnauthorized } from "./api";
import Navbar from "./components/Navbar";
import AlertBanner from "./components/AlertBanner";
import ChangePasswordModal from "./components/ChangePasswordModal";
import AdminView from "./components/AdminView";
import OwnerView from "./components/OwnerView";
import UserView from "./components/UserView";
import AuthView from "./components/AuthView";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const notify = (type, message) => {
    setAlert({ type, message });
  };

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
      setUser(null);
      setAlert({
        type: "error",
        message: "Your session has expired or is invalid. Please log in again.",
      });
    });
  }, []);

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    notify("success", `Welcome back, ${newUser.name || newUser.email}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    notify("info", "You have been logged out.");
  };

  return (
    <div>
      {user && token ? (
        <>
          <Navbar
            user={user}
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
            onLogout={handleLogout}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />

          <AlertBanner
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: "", message: "" })}
          />

          <main>
            {user.role === "admin" && (
              <AdminView token={token} onNotify={notify} />
            )}

            {user.role === "owner" && (
              <OwnerView token={token} onNotify={notify} />
            )}

            {user.role === "user" && (
              <UserView token={token} onNotify={notify} />
            )}
          </main>

          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            token={token}
            onNotify={notify}
          />
        </>
      ) : (
        <>
          <AlertBanner
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: "", message: "" })}
          />
          <AuthView 
            onLoginSuccess={handleLoginSuccess} 
            onNotify={notify} 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
          />
        </>
      )}
    </div>
  );
}

export default App;