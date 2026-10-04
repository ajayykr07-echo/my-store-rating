import { useState, useEffect, useCallback } from "react";
import { getOwnerDashboard, addOwnerStore } from "../api";
import {
  validateName,
  validateEmail,
  validateAddress,
} from "../utils/validators";
import StarRating from "./StarRating";

export default function OwnerView({ token, onNotify }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewSort, setReviewSort] = useState({ field: "created_at", direction: "desc" });

  // Add Store State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "" });
  const [storeFormErrors, setStoreFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchOwnerData = useCallback(async () => {
    setLoading(true);
    const data = await getOwnerDashboard(token);
    setLoading(false);
    setDashboard(data);
  }, [token]);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      const data = await getOwnerDashboard(token);
      if (!ignore) {
        setDashboard(data);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [token]);

  const handleReviewSort = (field) => {
    setReviewSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIndicator = (field) => {
    if (reviewSort.field !== field) {
      return <span style={{ opacity: 0.3, marginLeft: "4px" }}>↕</span>;
    }
    return (
      <span style={{ color: "var(--sky-600)", marginLeft: "4px", fontWeight: "bold" }}>
        {reviewSort.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const nameErr = validateName(newStore.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(newStore.email);
    if (emailErr) errors.email = emailErr;

    const addressErr = validateAddress(newStore.address);
    if (addressErr) errors.address = addressErr;

    if (Object.keys(errors).length > 0) {
      setStoreFormErrors(errors);
      return;
    }

    setStoreFormErrors({});
    setSubmitting(true);

    const res = await addOwnerStore(token, {
      name: newStore.name.trim(),
      email: newStore.email.trim(),
      address: newStore.address.trim(),
    });

    setSubmitting(false);

    if (res.store || res._ok) {
      onNotify("success", "Store added successfully!");
      setNewStore({ name: "", email: "", address: "" });
      setStoreFormErrors({});
      setIsAddModalOpen(false);
      fetchOwnerData();
    } else {
      const msg = res.message || "Failed to add store";
      onNotify("error", msg);
      setStoreFormErrors({ general: msg });
    }
  };

  const renderAddStoreModal = () => {
    if (!isAddModalOpen) return null;

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
        onClick={() => !submitting && setIsAddModalOpen(false)}
      >
        <div
          style={{
            background: "var(--white)",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "500px",
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
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--gray-900)" }}>
              Add a New Store
            </h2>
            <button
              type="button"
              onClick={() => !submitting && setIsAddModalOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "22px",
                lineHeight: 1,
                cursor: "pointer",
                color: "var(--gray-500)",
              }}
            >
              ×
            </button>
          </div>

          {storeFormErrors.general && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                backgroundColor: "var(--red-50)",
                border: "1px solid var(--red-200)",
                color: "var(--red-800)",
                fontSize: "13px",
                marginBottom: "14px",
              }}
            >
              {storeFormErrors.general}
            </div>
          )}

          <form onSubmit={handleAddStoreSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)" }}>
                  Store Name *
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color:
                      newStore.name.trim().length >= 20 && newStore.name.trim().length <= 60
                        ? "var(--emerald-600)"
                        : "var(--gray-500)",
                  }}
                >
                  {newStore.name.trim().length}/60 chars (min 20)
                </span>
              </div>
              <input
                type="text"
                placeholder="Store Name (1 to 50 characters)"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: storeFormErrors.name ? "1px solid var(--red-500)" : "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
              {storeFormErrors.name && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {storeFormErrors.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)", display: "block" }}>
                Store Email *
              </label>
              <input
                type="email"
                placeholder="store@example.com"
                value={newStore.email}
                onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: storeFormErrors.email ? "1px solid var(--red-500)" : "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
              {storeFormErrors.email && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {storeFormErrors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)" }}>
                  Store Address *
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color: newStore.address.trim().length <= 400 ? "var(--emerald-600)" : "var(--red-500)",
                  }}
                >
                  {newStore.address.trim().length}/400 chars max
                </span>
              </div>
              <textarea
                placeholder="Full physical address of the store"
                value={newStore.address}
                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                required
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: storeFormErrors.address ? "1px solid var(--red-500)" : "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }}
              />
              {storeFormErrors.address && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {storeFormErrors.address}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={submitting}
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
                disabled={submitting}
                style={{
                  padding: "8px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "6px",
                  border: "none",
                  background: "var(--sky-600)",
                  color: "var(--white)",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Adding..." : "Add Store"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "var(--gray-500)", textAlign: "center" }}>
        Loading store dashboard...
      </div>
    );
  }

  // Handle case when no store is assigned to this owner
  if (!dashboard || !dashboard.store) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "40px auto",
          padding: "32px",
          background: "var(--white)",
          borderRadius: "12px",
          border: "1px solid var(--gray-200)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏪</div>
        <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "var(--gray-900)" }}>
          No Store Assigned
        </h2>
        <p style={{ color: "var(--gray-500)", fontSize: "14px", lineHeight: 1.5, margin: "0 0 20px 0" }}>
          {dashboard?.message ||
            "There is no store assigned to your account yet. You can add your store now to get started."}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => {
              setNewStore({ name: "", email: "", address: "" });
              setStoreFormErrors({});
              setIsAddModalOpen(true);
            }}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "600",
              borderRadius: "6px",
              border: "none",
              background: "var(--sky-600)",
              color: "var(--white)",
              cursor: "pointer",
            }}
          >
            ➕ Add Store
          </button>
          <button
            type="button"
            onClick={fetchOwnerData}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "600",
              borderRadius: "6px",
              border: "1px solid var(--gray-300)",
              background: "var(--gray-50)",
              cursor: "pointer",
            }}
          >
            🔄 Check Again
          </button>
        </div>

        {renderAddStoreModal()}
      </div>
    );
  }

  const { store, average_rating, users = [] } = dashboard;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ textAlign: "left" }}>
      {/* Header and Refresh */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "var(--gray-900)" }}>
          Store Dashboard
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => {
              setNewStore({ name: "", email: "", address: "" });
              setStoreFormErrors({});
              setIsAddModalOpen(true);
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              background: "var(--sky-600)",
              color: "var(--white)",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ➕ Add Store
          </button>
          <button
            type="button"
            onClick={() => {
              fetchOwnerData();
              onNotify("info", "Dashboard refreshed");
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid var(--gray-300)",
              background: "var(--white)",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Store Overview Card */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "12px",
          border: "1px solid var(--gray-200)",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          marginBottom: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        <div>
          <div style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--gray-500)", fontWeight: "600" }}>
            Assigned Store
          </div>
          <h3 style={{ margin: "4px 0 8px 0", fontSize: "20px", color: "var(--gray-900)" }}>
            {store.name}
          </h3>
          <p style={{ margin: "4px 0", fontSize: "14px", color: "var(--gray-600)" }}>
            ✉️ {store.email}
          </p>
          <p style={{ margin: "4px 0", fontSize: "14px", color: "var(--gray-500)" }}>
            📍 {store.address}
          </p>
        </div>

        <div
          style={{
            background: "var(--gray-50)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            border: "1px solid var(--gray-200)",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase" }}>
            Store Performance
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--gray-900)" }}>
              {Number(average_rating) > 0 ? Number(average_rating).toFixed(2) : "0.00"}
            </span>
            <span style={{ fontSize: "18px", color: "var(--gray-500)" }}>/ 5.0</span>
          </div>
          <div style={{ marginTop: "6px" }}>
            <StarRating value={average_rating} readOnly={true} size={22} />
          </div>
          <div style={{ marginTop: "8px", fontSize: "13px", color: "var(--gray-600)" }}>
            Total customer reviews: <strong>{users.length}</strong>
          </div>
        </div>
      </div>

      {/* Customer Ratings Breakdown */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "12px",
          border: "1px solid var(--gray-200)",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "var(--gray-900)" }}>
          Customer Ratings & Reviews ({users.length})
        </h3>

        {users.length === 0 ? (
          <div
            style={{
              padding: "36px",
              textAlign: "center",
              background: "var(--gray-50)",
              borderRadius: "8px",
              border: "1px dashed var(--gray-300)",
              color: "var(--gray-500)",
              fontSize: "14px",
            }}
          >
            No ratings have been submitted for your store yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                  <th
                    onClick={() => handleReviewSort("user_name")}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "var(--gray-700)",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    Customer {renderSortIndicator("user_name")}
                  </th>
                  <th
                    onClick={() => handleReviewSort("user_email")}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "var(--gray-700)",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    Email {renderSortIndicator("user_email")}
                  </th>
                  <th
                    onClick={() => handleReviewSort("rating")}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "var(--gray-700)",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    Rating {renderSortIndicator("rating")}
                  </th>
                  <th
                    onClick={() => handleReviewSort("created_at")}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "var(--gray-700)",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    Date Submitted {renderSortIndicator("created_at")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...users]
                  .sort((a, b) => {
                    const factor = reviewSort.direction === "asc" ? 1 : -1;
                    if (reviewSort.field === "rating") {
                      return (Number(a.rating || 0) - Number(b.rating || 0)) * factor;
                    }
                    if (reviewSort.field === "created_at") {
                      return (new Date(a.created_at || 0) - new Date(b.created_at || 0)) * factor;
                    }
                    const valA = (a[reviewSort.field] || "").toString().toLowerCase();
                    const valB = (b[reviewSort.field] || "").toString().toLowerCase();
                    return valA.localeCompare(valB) * factor;
                  })
                  .map((review, idx) => (
                    <tr
                      key={`${review.user_email}-${review.created_at || idx}`}
                      style={{ borderBottom: "1px solid var(--gray-100)" }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: "600", color: "var(--gray-900)" }}>
                        {review.user_name}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--gray-600)" }}>
                        {review.user_email}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StarRating value={review.rating} readOnly={true} size={16} />
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--gray-500)", fontSize: "13px" }}>
                        {formatDate(review.created_at)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Adding Store */}
      {renderAddStoreModal()}
    </div>
  );
}
