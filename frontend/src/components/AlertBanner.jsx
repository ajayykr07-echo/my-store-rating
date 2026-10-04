export default function AlertBanner({ type = "info", message, onClose }) {
  if (!message) return null;

  const bgColors = {
    success: "var(--emerald-50)",
    error: "var(--red-50)",
    warning: "var(--amber-50)",
    info: "var(--blue-50)",
  };

  const textColors = {
    success: "var(--emerald-800)",
    error: "var(--red-800)",
    warning: "var(--amber-800)",
    info: "var(--blue-800)",
  };

  const borderColors = {
    success: "var(--emerald-200)",
    error: "var(--red-200)",
    warning: "var(--amber-200)",
    info: "var(--blue-200)",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        marginBottom: "16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        backgroundColor: bgColors[type] || bgColors.info,
        color: textColors[type] || textColors.info,
        border: `1px solid ${borderColors[type] || borderColors.info}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            lineHeight: 1,
            cursor: "pointer",
            color: "inherit",
            opacity: 0.7,
            marginLeft: "12px",
          }}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
