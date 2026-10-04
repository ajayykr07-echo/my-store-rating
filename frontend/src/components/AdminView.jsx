import { useState, useEffect, useCallback } from "react";
import {
  getAdminDashboard,
  getAdminStores,
  getAdminUsers,
  addStore,
  deleteStore,
  addUser,
} from "../api";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from "../utils/validators";
import StarRating from "./StarRating";

export default function AdminView({ token, onNotify }) {
  const [activeTab, setActiveTab] = useState("stores");
  const [dashboard, setDashboard] = useState({
    total_users: 0,
    total_stores: 0,
    total_ratings: 0,
  });
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [ownersList, setOwnersList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Store Filters & Sort
  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [storeSort, setStoreSort] = useState({ field: "name", direction: "asc" });

  // User Filters & Sort
  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [userSort, setUserSort] = useState({ field: "name", direction: "asc" });

  // Add Store Form
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });
  const [storeFormErrors, setStoreFormErrors] = useState({});
  const [storeSubmitting, setStoreSubmitting] = useState(false);

  // Add User Form
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [userSubmitting, setUserSubmitting] = useState(false);

  // Load Dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    const data = await getAdminDashboard(token);
    if (data && typeof data.total_users !== "undefined") {
      setDashboard({
        total_users: data.total_users,
        total_stores: data.total_stores,
        total_ratings: data.total_ratings,
      });
    }
  }, [token]);

  // Load Stores with filters
  const fetchStores = useCallback(
    async (filters = storeFilters) => {
      setLoading(true);
      const data = await getAdminStores(token, filters);
      setLoading(false);
      if (data && Array.isArray(data.stores)) {
        setStores(data.stores);
      }
    },
    [token, storeFilters]
  );

  // Load Users with filters
  const fetchUsers = useCallback(
    async (filters = userFilters) => {
      setLoading(true);
      const data = await getAdminUsers(token, filters);
      setLoading(false);
      if (data && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    },
    [token, userFilters]
  );

  // Load Owners for Store Owner dropdown
  const fetchOwners = useCallback(async () => {
    const data = await getAdminUsers(token, { role: "owner" });
    if (data && Array.isArray(data.users)) {
      setOwnersList(data.users);
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      const [dashData, storesData, usersData, ownersData] = await Promise.all([
        getAdminDashboard(token),
        getAdminStores(token),
        getAdminUsers(token),
        getAdminUsers(token, { role: "owner" }),
      ]);

      if (!ignore) {
        if (dashData && typeof dashData.total_users !== "undefined") {
          setDashboard({
            total_users: dashData.total_users,
            total_stores: dashData.total_stores,
            total_ratings: dashData.total_ratings,
          });
        }
        if (storesData && Array.isArray(storesData.stores)) {
          setStores(storesData.stores);
        }
        if (usersData && Array.isArray(usersData.users)) {
          setUsers(usersData.users);
        }
        if (ownersData && Array.isArray(ownersData.users)) {
          setOwnersList(ownersData.users);
        }
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, [token]);

  // Handle store sorting
  const handleStoreSort = (field) => {
    setStoreSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedStores = [...stores].sort((a, b) => {
    const { field, direction } = storeSort;
    const factor = direction === "asc" ? 1 : -1;

    if (field === "rating") {
      return (Number(a.rating || 0) - Number(b.rating || 0)) * factor;
    }
    const valA = (a[field] || "").toString().toLowerCase();
    const valB = (b[field] || "").toString().toLowerCase();
    return valA.localeCompare(valB) * factor;
  });

  // Handle user sorting
  const handleUserSort = (field) => {
    setUserSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    const { field, direction } = userSort;
    const factor = direction === "asc" ? 1 : -1;

    if (field === "owner_rating") {
      return (Number(a.owner_rating || 0) - Number(b.owner_rating || 0)) * factor;
    }
    const valA = (a[field] || "").toString().toLowerCase();
    const valB = (b[field] || "").toString().toLowerCase();
    return valA.localeCompare(valB) * factor;
  });

  // Handle Add Store Submit
  
  const handleDeleteStore = async (storeId, storeName) => {
    if (!window.confirm(`Are you sure you want to delete "${storeName}"? This will also delete all its ratings.`)) {
      return;
    }
    const res = await deleteStore(token, storeId);
    if (res.message === "Store deleted successfully") {
      onNotify("success", `Store "${storeName}" deleted.`);
      fetchStores();
      fetchDashboardStats();
    } else {
      onNotify("error", res.message || "Failed to delete store");
    }
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
    setStoreSubmitting(true);

    const payload = {
      name: newStore.name.trim(),
      email: newStore.email.trim(),
      address: newStore.address.trim(),
      owner_id: newStore.owner_id ? Number(newStore.owner_id) : null,
    };

    const res = await addStore(token, payload);
    setStoreSubmitting(false);

    if (res.store || res._ok) {
      onNotify("success", "Store registered successfully!");
      setNewStore({ name: "", email: "", address: "", owner_id: "" });
      fetchStores();
      fetchDashboardStats();
      fetchUsers();
      setActiveTab("stores");
    } else {
      onNotify("error", res.message || "Failed to add store");
    }
  };

  // Handle Add User Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const nameErr = validateName(newUser.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(newUser.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validatePassword(newUser.password);
    if (passErr) errors.password = passErr;

    const addressErr = validateAddress(newUser.address);
    if (addressErr) errors.address = addressErr;

    if (!["admin", "user", "owner"].includes(newUser.role)) {
      errors.role = "Invalid role selected";
    }

    if (Object.keys(errors).length > 0) {
      setUserFormErrors(errors);
      return;
    }
    setUserFormErrors({});
    setUserSubmitting(true);

    const res = await addUser(token, {
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      password: newUser.password,
      address: newUser.address.trim(),
      role: newUser.role,
    });
    setUserSubmitting(false);

    if (res.user || res._ok) {
      onNotify("success", `User (${newUser.role}) created successfully!`);
      setNewUser({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "user",
      });
      fetchUsers();
      fetchOwners();
      fetchDashboardStats();
      setActiveTab("users");
    } else {
      onNotify("error", res.message || "Failed to add user");
    }
  };

  const renderSortIndicator = (currentField, activeSort) => {
    if (activeSort.field !== currentField) {
      return <span style={{ opacity: 0.3, marginLeft: "4px" }}>↕</span>;
    }
    return (
      <span style={{ color: "var(--indigo-600)", marginLeft: "4px", fontWeight: "bold" }}>
        {activeSort.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div>
      {/* Metrics Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--white)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid var(--gray-200)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase" }}>
            Total Number of Users
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--indigo-600)", marginTop: "4px" }}>
            {dashboard.total_users}
          </div>
        </div>

        <div
          style={{
            background: "var(--white)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid var(--gray-200)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase" }}>
            Total Number of Stores
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--sky-600)", marginTop: "4px" }}>
            {dashboard.total_stores}
          </div>
        </div>

        <div
          style={{
            background: "var(--white)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid var(--gray-200)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase" }}>
            Total Submitted Ratings
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--emerald-600)", marginTop: "4px" }}>
            {dashboard.total_ratings}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "2px solid var(--gray-200)",
          marginBottom: "20px",
        }}
      >
        {[
          { id: "stores", label: `Stores List (${stores.length})` },
          { id: "add-store", label: "+ Add Store" },
          { id: "users", label: `Users List (${users.length})` },
          { id: "add-user", label: "+ Add User" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "3px solid var(--indigo-600)" : "3px solid transparent",
              color: activeTab === tab.id ? "var(--indigo-600)" : "var(--gray-500)",
              marginBottom: "-2px",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STORES LIST */}
      {activeTab === "stores" && (
        <div style={{ textAlign: "left" }}>
          {/* Store Filters (Name, Email, Address) */}
          <div
            style={{
              background: "var(--white)",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid var(--gray-200)",
              marginBottom: "24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--gray-800)", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filter Stores
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const cleared = { name: "", email: "", address: "" };
                    setStoreFilters(cleared);
                    fetchStores(cleared);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: "transparent",
                    color: "var(--gray-500)",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.target.style.color = "var(--gray-800)"; e.target.style.background = "var(--gray-100)"; }}
                  onMouseOut={(e) => { e.target.style.color = "var(--gray-500)"; e.target.style.background = "transparent"; }}
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => fetchStores(storeFilters)}
                  disabled={loading}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--white)",
                    color: "var(--gray-700)",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Refresh
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  type="text"
                  placeholder="Search by store name..."
                  value={storeFilters.name}
                  onChange={(e) => {
                    const updated = { ...storeFilters, name: e.target.value };
                    setStoreFilters(updated);
                    fetchStores(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--gray-50)",
                    boxSizing: "border-box",
                    fontSize: "13px",
                    transition: "all 0.2s",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.background = "var(--white)"; e.target.style.borderColor = "var(--indigo-400)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={(e) => { e.target.style.background = "var(--gray-50)"; e.target.style.borderColor = "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={storeFilters.email}
                  onChange={(e) => {
                    const updated = { ...storeFilters, email: e.target.value };
                    setStoreFilters(updated);
                    fetchStores(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--gray-50)",
                    boxSizing: "border-box",
                    fontSize: "13px",
                    transition: "all 0.2s",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.background = "var(--white)"; e.target.style.borderColor = "var(--indigo-400)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={(e) => { e.target.style.background = "var(--gray-50)"; e.target.style.borderColor = "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <input
                  type="text"
                  placeholder="Search by address..."
                  value={storeFilters.address}
                  onChange={(e) => {
                    const updated = { ...storeFilters, address: e.target.value };
                    setStoreFilters(updated);
                    fetchStores(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--gray-50)",
                    boxSizing: "border-box",
                    fontSize: "13px",
                    transition: "all 0.2s",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.background = "var(--white)"; e.target.style.borderColor = "var(--indigo-400)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={(e) => { e.target.style.background = "var(--gray-50)"; e.target.style.borderColor = "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          </div>

          {/* Stores Table with Sorting */}
          {sortedStores.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                background: "var(--gray-50)",
                borderRadius: "12px",
                border: "1px dashed var(--gray-300)",
                color: "var(--gray-500)",
              }}
            >
              {stores.length === 0
                ? "No stores registered yet. Click '+ Add Store' to add one."
                : "No stores match your search criteria."}
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                background: "var(--white)",
                borderRadius: "10px",
                border: "1px solid var(--gray-200)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                    <th
                      onClick={() => handleStoreSort("name")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Store Name {renderSortIndicator("name", storeSort)}
                    </th>
                    <th
                      onClick={() => handleStoreSort("email")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Email {renderSortIndicator("email", storeSort)}
                    </th>
                    <th
                      onClick={() => handleStoreSort("address")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Address {renderSortIndicator("address", storeSort)}
                    </th>
                    <th
                      onClick={() => handleStoreSort("rating")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Overall Rating {renderSortIndicator("rating", storeSort)}
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: "600", color: "var(--gray-600)", fontSize: "12px", textTransform: "uppercase" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {sortedStores.map((store) => (
                    <tr key={store.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: "600", color: "var(--gray-900)" }}>
                        {store.name}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--gray-600)" }}>{store.email}</td>
                      <td style={{ padding: "12px 16px", color: "var(--gray-500)" }}>{store.address}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <StarRating value={store.rating} readOnly={true} size={16} />
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteStore(store.id, store.name)}
                            style={{
                              padding: "4px 8px",
                              background: "var(--red-50)",
                              color: "var(--red-600)",
                              border: "1px solid var(--red-200)",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => { e.target.style.background = "var(--red-100)"; e.target.style.borderColor = "var(--red-300)"; }}
                            onMouseOut={(e) => { e.target.style.background = "var(--red-50)"; e.target.style.borderColor = "var(--red-200)"; }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD STORE */}
      {activeTab === "add-store" && (
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "var(--white)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid var(--gray-200)",
            textAlign: "left",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>
            Register New Store
          </h2>

          <form onSubmit={handleAddStoreSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)" }}>
                  Store Name *
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color: newStore.name.length >= 20 && newStore.name.length <= 60 ? "var(--emerald-600)" : "var(--gray-500)",
                  }}
                >
                  {newStore.name.length}/60 chars (min 20)
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
                }}
              />
              {storeFormErrors.name && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {storeFormErrors.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
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
                }}
              />
              {storeFormErrors.email && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {storeFormErrors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)" }}>
                  Store Address *
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color: newStore.address.length <= 400 ? "var(--emerald-600)" : "var(--red-500)",
                  }}
                >
                  {newStore.address.length}/400 chars max
                </span>
              </div>
              <textarea
                placeholder="Store physical address"
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
                }}
              />
              {storeFormErrors.address && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {storeFormErrors.address}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)", display: "block" }}>
                Assign Store Owner (Optional)
              </label>
              <select
                value={newStore.owner_id}
                onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                  background: "var(--white)",
                }}
              >
                <option value="">-- No Owner Assigned (Assign Later) --</option>
                {ownersList.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
              <small style={{ color: "var(--gray-500)", fontSize: "12px", display: "block", marginTop: "4px" }}>
                Only users registered with the 'Store Owner' role appear in this list.
              </small>
            </div>

            <button
              type="submit"
              disabled={storeSubmitting}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                background: "var(--indigo-600)",
                color: "var(--white)",
                cursor: storeSubmitting ? "not-allowed" : "pointer",
                opacity: storeSubmitting ? 0.7 : 1,
              }}
            >
              {storeSubmitting ? "Registering Store..." : "Create Store"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: USERS LIST */}
      {activeTab === "users" && (
        <div style={{ textAlign: "left" }}>
          {/* User Filters (Name, Email, Address, Role) */}
          <div
            style={{
              background: "var(--white)",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid var(--gray-200)",
              marginBottom: "24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--gray-800)", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filter Users
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const cleared = { name: "", email: "", address: "", role: "" };
                    setUserFilters(cleared);
                    fetchUsers(cleared);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: "transparent",
                    color: "var(--gray-500)",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.target.style.color = "var(--gray-800)"; e.target.style.background = "var(--gray-100)"; }}
                  onMouseOut={(e) => { e.target.style.color = "var(--gray-500)"; e.target.style.background = "transparent"; }}
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => fetchUsers(userFilters)}
                  disabled={loading}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--white)",
                    color: "var(--gray-700)",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Refresh
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={userFilters.name}
                  onChange={(e) => {
                    const updated = { ...userFilters, name: e.target.value };
                    setUserFilters(updated);
                    fetchUsers(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--gray-50)",
                    boxSizing: "border-box",
                    fontSize: "13px",
                    transition: "all 0.2s",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.background = "var(--white)"; e.target.style.borderColor = "var(--indigo-400)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={(e) => { e.target.style.background = "var(--gray-50)"; e.target.style.borderColor = "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={userFilters.email}
                  onChange={(e) => {
                    const updated = { ...userFilters, email: e.target.value };
                    setUserFilters(updated);
                    fetchUsers(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--gray-50)",
                    boxSizing: "border-box",
                    fontSize: "13px",
                    transition: "all 0.2s",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.background = "var(--white)"; e.target.style.borderColor = "var(--indigo-400)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={(e) => { e.target.style.background = "var(--gray-50)"; e.target.style.borderColor = "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <input
                  type="text"
                  placeholder="Search by address..."
                  value={userFilters.address}
                  onChange={(e) => {
                    const updated = { ...userFilters, address: e.target.value };
                    setUserFilters(updated);
                    fetchUsers(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--gray-50)",
                    boxSizing: "border-box",
                    fontSize: "13px",
                    transition: "all 0.2s",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.background = "var(--white)"; e.target.style.borderColor = "var(--indigo-400)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={(e) => { e.target.style.background = "var(--gray-50)"; e.target.style.borderColor = "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                <select
                  value={userFilters.role}
                  onChange={(e) => {
                    const updated = { ...userFilters, role: e.target.value };
                    setUserFilters(updated);
                    fetchUsers(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-200)",
                    background: "var(--gray-50)",
                    boxSizing: "border-box",
                    fontSize: "13px",
                    transition: "all 0.2s",
                    outline: "none",
                    appearance: "none",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => { e.target.style.background = "var(--white)"; e.target.style.borderColor = "var(--indigo-400)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={(e) => { e.target.style.background = "var(--gray-50)"; e.target.style.borderColor = "var(--gray-200)"; e.target.style.boxShadow = "none"; }}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Store Owner</option>
                  <option value="user">Normal User</option>
                </select>
                <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }} width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Users Table with Sorting and Store Owner Rating */}
          {sortedUsers.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                background: "var(--gray-50)",
                borderRadius: "12px",
                border: "1px dashed var(--gray-300)",
                color: "var(--gray-500)",
              }}
            >
              No users found matching current filters.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                background: "var(--white)",
                borderRadius: "10px",
                border: "1px solid var(--gray-200)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                    <th
                      onClick={() => handleUserSort("name")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Name {renderSortIndicator("name", userSort)}
                    </th>
                    <th
                      onClick={() => handleUserSort("email")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Email {renderSortIndicator("email", userSort)}
                    </th>
                    <th
                      onClick={() => handleUserSort("address")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Address {renderSortIndicator("address", userSort)}
                    </th>
                    <th
                      onClick={() => handleUserSort("role")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Role {renderSortIndicator("role", userSort)}
                    </th>
                    <th
                      onClick={() => handleUserSort("owner_rating")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "var(--gray-700)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      Store Owner Rating {renderSortIndicator("owner_rating", userSort)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((u) => {
                    const roleColor =
                      u.role === "admin"
                        ? "var(--violet-600)"
                        : u.role === "owner"
                        ? "var(--sky-600)"
                        : "var(--emerald-600)";
                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: "600", color: "var(--gray-900)" }}>
                          {u.name}
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--gray-600)" }}>{u.email}</td>
                        <td style={{ padding: "12px 16px", color: "var(--gray-500)" }}>{u.address}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              borderRadius: "9999px",
                              backgroundColor: `${roleColor}15`,
                              color: roleColor,
                              border: `1px solid ${roleColor}30`,
                            }}
                          >
                            {u.role === "owner" ? "Store Owner" : u.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {u.role === "owner" ? (
                            <div>
                              <div style={{ fontWeight: "600", color: "var(--gray-900)", fontSize: "13px" }}>
                                {u.store_name || "Unassigned Store"}
                              </div>
                              <div style={{ marginTop: "2px" }}>
                                <StarRating value={u.owner_rating} readOnly={true} size={15} />
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: "var(--gray-400)", fontSize: "13px" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADD USER */}
      {activeTab === "add-user" && (
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "var(--white)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid var(--gray-200)",
            textAlign: "left",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>
            Add New User
          </h2>

          <form onSubmit={handleAddUserSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)" }}>
                  Full Name *
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color: newUser.name.length >= 20 && newUser.name.length <= 60 ? "var(--emerald-600)" : "var(--gray-500)",
                  }}
                >
                  {newUser.name.length}/60 chars (min 20)
                </span>
              </div>
              <input
                type="text"
                placeholder="User Full Name (20 to 60 characters)"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: userFormErrors.name ? "1px solid var(--red-500)" : "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                }}
              />
              {userFormErrors.name && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {userFormErrors.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)", display: "block" }}>
                Email Address *
              </label>
              <input
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: userFormErrors.email ? "1px solid var(--red-500)" : "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                }}
              />
              {userFormErrors.email && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {userFormErrors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)", display: "block" }}>
                Password *
              </label>
              <input
                type="password"
                placeholder="8-16 chars, 1 uppercase, 1 special char"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: userFormErrors.password ? "1px solid var(--red-500)" : "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                }}
              />
              <small style={{ color: "var(--gray-500)", fontSize: "12px", display: "block", marginTop: "4px" }}>
                Must be 8-16 characters with at least one uppercase letter and one special character.
              </small>
              {userFormErrors.password && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {userFormErrors.password}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)" }}>
                  Address *
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color: newUser.address.length <= 400 ? "var(--emerald-600)" : "var(--red-500)",
                  }}
                >
                  {newUser.address.length}/400 chars max
                </span>
              </div>
              <textarea
                placeholder="User Residential/Office Address"
                value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                required
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: userFormErrors.address ? "1px solid var(--red-500)" : "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              {userFormErrors.address && (
                <div style={{ color: "var(--red-500)", fontSize: "12px", marginTop: "4px" }}>
                  {userFormErrors.address}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-700)", display: "block" }}>
                Role *
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  border: "1px solid var(--gray-300)",
                  boxSizing: "border-box",
                  background: "var(--white)",
                }}
              >
                <option value="user">Normal User</option>
                <option value="owner">Store Owner</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={userSubmitting}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                background: "var(--indigo-600)",
                color: "var(--white)",
                cursor: userSubmitting ? "not-allowed" : "pointer",
                opacity: userSubmitting ? 0.7 : 1,
              }}
            >
              {userSubmitting ? "Creating User..." : "Create User"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
