export default function Navbar({
  user,
  onOpenPasswordModal,
  onLogout,
  darkMode,
  toggleDarkMode,
}) {
  const roleBadges = {
    admin: { label: "System Administrator", bg: "var(--violet-600)", color: "var(--white)" },
    owner: { label: "Store Owner", bg: "var(--sky-600)", color: "var(--white)" },
    user: { label: "Normal User", bg: "var(--emerald-600)", color: "var(--white)" },
  };

  const badge = roleBadges[user?.role] || {
    label: user?.role || "User",
    bg: "var(--gray-500)",
    color: "var(--white)",
  };

  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        background: "var(--card-bg)",
        borderBottom: "1px solid var(--gray-200)",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        marginBottom: "24px",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--indigo-600) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--gray-900)",
              textAlign: "left",
            }}
          >
            My Store Rating
          </h1>
          <div
            style={{
              fontSize: "13px",
              color: "var(--gray-500)",
              textAlign: "left",
              marginTop: "2px",
            }}
          >
            Welcome, <strong>{user?.name || user?.email}</strong>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "4px 10px",
            borderRadius: "9999px",
            backgroundColor: badge.bg,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>

        <button
          type="button"
          onClick={toggleDarkMode}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "6px",
            border: "1px solid var(--gray-300)",
            background: "var(--gray-50)",
            color: "var(--gray-700)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Toggle Dark Mode"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <button
          type="button"
          onClick={onOpenPasswordModal}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "6px",
            border: "1px solid var(--gray-300)",
            background: "var(--gray-50)",
            color: "var(--gray-700)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Change Password"
        >
          🔑 Change Password
        </button>

        <button
          type="button"
          onClick={onLogout}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: "600",
            borderRadius: "6px",
            border: "none",
            background: "var(--red-500)",
            color: "var(--white)",
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
