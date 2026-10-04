import { useState, useEffect } from "react";
import { login, signup } from "../api";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from "../utils/validators";

export default function AuthView({ onLoginSuccess, onNotify, darkMode, toggleDarkMode, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'owner-login' | 'signup'

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);
  const [loading, setLoading] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("emailHistory")) || [];
    setEmailHistory(history);
  }, []);

  const saveEmailToHistory = (email) => {
    if (!email) return;
    const history = JSON.parse(localStorage.getItem("emailHistory")) || [];
    if (!history.includes(email)) {
      history.push(email);
      localStorage.setItem("emailHistory", JSON.stringify(history));
      setEmailHistory(history);
    }
  };

  // Login form state (User & Admin)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Owner login form state
  const [ownerData, setOwnerData] = useState({
    email: "",
    password: "",
  });

  // Signup form state (Normal User)
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setFormErrors({});
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!loginData.email || !loginData.password) {
      setFormErrors({ general: "Please enter both email and password" });
      return;
    }

    setLoading(true);
    const data = await login(loginData.email, loginData.password);
    setLoading(false);

    if (data.token && data.user) {
      saveEmailToHistory(loginData.email);
      onLoginSuccess(data.token, data.user);
    } else {
      setFormErrors({ general: data.message || "Invalid email or password" });
    }
  };

  const handleOwnerLoginSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!ownerData.email || !ownerData.password) {
      setFormErrors({ general: "Please enter your store owner email and password" });
      return;
    }

    setLoading(true);
    const data = await login(ownerData.email, ownerData.password);
    setLoading(false);

    if (data.token && data.user) {
      if (data.user.role !== "owner") {
        setFormErrors({
          general: `Access Denied: This account is registered as '${data.user.role}'. This portal is exclusively for Store Owners. Please use the Customer & Admin Sign In tab.`,
        });
        return;
      }
      saveEmailToHistory(ownerData.email);
      onLoginSuccess(data.token, data.user);
    } else {
      setFormErrors({ general: data.message || "Invalid store owner credentials" });
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const nameErr = validateName(signupData.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(signupData.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validatePassword(signupData.password);
    if (passErr) errors.password = passErr;

    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    const addressErr = validateAddress(signupData.address);
    if (addressErr) errors.address = addressErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setLoading(true);

    const data = await signup({
      name: signupData.name.trim(),
      email: signupData.email.trim(),
      password: signupData.password,
      address: signupData.address.trim(),
    });
    setLoading(false);

    if (data.user || data._ok) {
      saveEmailToHistory(signupData.email.trim());
      onNotify("success", "Account created successfully! Please log in.");
      setLoginData((prev) => ({ ...prev, email: signupData.email.trim() }));
      setSignupData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
      });
      setMode("login");
    } else {
      setFormErrors({ general: data.message || "Signup failed. Please try again." });
    }
  };

  const isOwnerMode = mode === "owner-login";

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundImage: `linear-gradient(to bottom right, rgba(15, 15, 15, 0.4), rgba(0, 0, 0, 0.7)), url('/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(25, 25, 25, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(228, 197, 144, 0.2)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          overflow: "hidden",
          textAlign: "left",
          color: "white"
        }}
      >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "8px",
          margin: "16px 16px 0 16px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => handleModeSwitch("login")}
          style={{
            flex: 1,
            padding: "10px 6px",
            fontSize: "13px",
            fontWeight: "500",
            border: "none",
            borderRadius: "12px",
            background: mode === "login" ? "rgba(255, 255, 255, 0.15)" : "transparent",
            color: mode === "login" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
            boxShadow: mode === "login" ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          User / Admin
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("owner-login")}
          style={{
            flex: 1,
            padding: "10px 6px",
            fontSize: "13px",
            fontWeight: "500",
            border: "none",
            borderRadius: "12px",
            background: mode === "owner-login" ? "rgba(255, 255, 255, 0.15)" : "transparent",
            color: mode === "owner-login" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
            boxShadow: mode === "owner-login" ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Store Owner
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("signup")}
          style={{
            flex: 1,
            padding: "10px 6px",
            fontSize: "13px",
            fontWeight: "500",
            border: "none",
            borderRadius: "12px",
            background: mode === "signup" ? "rgba(255, 255, 255, 0.15)" : "transparent",
            color: mode === "signup" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
            boxShadow: mode === "signup" ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Brand Header */}
      <div
        style={{
          position: "relative",
          background: "transparent",
          borderBottom: "1px solid rgba(228, 197, 144, 0.15)",
          padding: "28px 24px",
          color: "white",
          textAlign: "center",
          transition: "background 0.3s ease",
        }}
      >
        <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "6px 10px",
                fontSize: "14px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: "none",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Close"
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
            >
              ✕
            </button>
          )}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)",
            color: "white",
            marginBottom: "16px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <h1
          style={{
            margin: "0 0 4px 0",
            fontSize: "26px", fontFamily: "'Playfair Display', serif", letterSpacing: "0.5px",
            fontWeight: "700",
            color: "#ffffff",
          }}
        >
          {isOwnerMode ? "Store Owner Portal" : "My Store Rating"}
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "#cccccc", letterSpacing: "0.5px" }}>
          {isOwnerMode
            ? "Manage your store ratings, customer feedback & reviews"
            : "Discover local stores, view ratings, and submit verified reviews"}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 28px" }}>
        {formErrors.general && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              backgroundColor: "var(--red-50)",
              border: "1px solid var(--red-200)",
              color: "var(--red-800)",
              fontSize: "13px",
              marginBottom: "18px",
              lineHeight: 1.4,
            }}
          >
            {formErrors.general}
          </div>
        )}

        {/* 1. REGULAR LOGIN (USER & ADMIN) */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                list="email-history"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                background: "var(--indigo-600)",
                color: "var(--white)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                marginBottom: "16px",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Quick link to Store Owner Login */}
            <div
              style={{
                textAlign: "center",
                paddingTop: "12px",
                borderTop: "1px solid var(--gray-100)",
                fontSize: "13px",
                color: "var(--gray-500)",
              }}
            >
              Are you a Store Owner?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("owner-login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--sky-600)",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Go to Store Owner Portal →
              </button>
            </div>
          </form>
        )}

        {/* 2. DEDICATED STORE OWNER LOGIN */}
        {mode === "owner-login" && (
          <form onSubmit={handleOwnerLoginSubmit}>
            <div
              style={{
                background: "var(--sky-50)",
                border: "1px solid var(--sky-200)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "var(--sky-700)",
                lineHeight: 1.4,
              }}
            >
              🏪 <strong>Store Owner Portal:</strong> Log in with your store owner credentials to view ratings submitted for your store.
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)", marginBottom: "6px" }}>
                Store Owner Email
              </label>
              <input
                type="email"
                placeholder="owner@example.com"
                value={ownerData.email}
                onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                required
                list="email-history"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={ownerData.password}
                onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                background: "var(--sky-600)",
                color: "var(--white)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 2px 4px rgba(2, 132, 199, 0.25)",
                marginBottom: "16px",
              }}
            >
              {loading ? "Authenticating..." : "Sign In to Store Portal"}
            </button>

            <div
              style={{
                textAlign: "center",
                paddingTop: "12px",
                borderTop: "1px solid var(--gray-100)",
                fontSize: "13px",
                color: "var(--gray-500)",
              }}
            >
              Not a store owner?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--indigo-600)",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Back to User & Admin Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. NORMAL USER SIGNUP */}
        {mode === "signup" && (
          <form onSubmit={handleSignupSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)" }}>
                  Full Name *
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color: signupData.name.length >= 20 && signupData.name.length <= 60 ? "var(--emerald-600)" : "var(--gray-500)",
                  }}
                >
                  {signupData.name.length}/60 (min 20)
                </span>
              </div>
              <input
                type="text"
                placeholder="Your full legal name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  marginTop: "4px",
                  borderRadius: "6px",
                  border: formErrors.name ? "1px solid var(--red-500)" : "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
              {formErrors.name && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)" }}>
                Email Address *
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
                list="email-history"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  marginTop: "4px",
                  borderRadius: "6px",
                  border: formErrors.email ? "1px solid var(--red-500)" : "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
              {formErrors.email && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)" }}>
                Password *
              </label>
              <input
                type="password"
                placeholder="8-16 chars, 1 uppercase, 1 special char"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  marginTop: "4px",
                  borderRadius: "6px",
                  border: formErrors.password ? "1px solid var(--red-500)" : "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
              <small style={{ color: "var(--gray-500)", fontSize: "11px", display: "block", marginTop: "3px" }}>
                Must be 8-16 chars, with at least 1 uppercase and 1 special char.
              </small>
              {formErrors.password && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.password}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)" }}>
                Confirm Password *
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  marginTop: "4px",
                  borderRadius: "6px",
                  border: formErrors.confirmPassword ? "1px solid var(--red-500)" : "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
              {formErrors.confirmPassword && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.confirmPassword}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)" }}>
                  Residential Address *
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color: signupData.address.length <= 400 ? "var(--emerald-600)" : "var(--red-500)",
                  }}
                >
                  {signupData.address.length}/400 max
                </span>
              </div>
              <textarea
                placeholder="Your home address"
                value={signupData.address}
                onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                required
                rows={2}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  marginTop: "4px",
                  borderRadius: "6px",
                  border: formErrors.address ? "1px solid var(--red-500)" : "1px solid rgba(255, 255, 255, 0.15)", background: "rgba(0, 0, 0, 0.2)", color: "white",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }}
              />
              {formErrors.address && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.address}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                background: "var(--indigo-600)",
                color: "var(--white)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
      <datalist id="email-history">
        {emailHistory.map((email, idx) => (
          <option key={idx} value={email} />
        ))}
      </datalist>
    </div>
    </div>
  );
}
