import { useState } from "react";
import { updatePassword } from "../api";
import { validatePassword } from "../utils/validators";

export default function ChangePasswordModal({ isOpen, onClose, token, onNotify }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);
    const result = await updatePassword(token, currentPassword, newPassword);
    setLoading(false);

    if (result._ok || result.message === "Password updated successfully") {
      onNotify("success", "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } else {
      setError(result.message || "Failed to update password");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--white)",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "460px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          textAlign: "left",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--gray-900)",
            }}
          >
            Update Your Password
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              lineHeight: 1,
              cursor: "pointer",
              color: "var(--gray-500)",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              backgroundColor: "var(--red-50)",
              border: "1px solid var(--red-200)",
              color: "var(--red-800)",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--gray-700)",
                marginBottom: "6px",
              }}
            >
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid var(--gray-300)",
                borderRadius: "6px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--gray-700)",
                marginBottom: "6px",
              }}
            >
              New Password
            </label>
            <input
              type="password"
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid var(--gray-300)",
                borderRadius: "6px",
                boxSizing: "border-box",
              }}
            />
            <small style={{ color: "var(--gray-500)", fontSize: "12px", display: "block", marginTop: "4px" }}>
              Must be 8-16 characters with at least one uppercase letter and one special character.
            </small>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--gray-700)",
                marginBottom: "6px",
              }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid var(--gray-300)",
                borderRadius: "6px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "6px",
                border: "1px solid var(--gray-300)",
                background: "var(--white)",
                color: "var(--gray-700)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 18px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                background: "var(--indigo-600)",
                color: "var(--white)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
