import { useState, useEffect, useCallback } from "react";
import { getStores, submitRating, updateRating } from "../api";
import StarRating from "./StarRating";

export default function UserView({ token, onNotify }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [userRatings, setUserRatings] = useState({});
  const [submittingStoreId, setSubmittingStoreId] = useState(null);

  const fetchUserStores = useCallback(
    async (name = searchName, address = searchAddress) => {
      setLoading(true);
      const data = await getStores(token, name, address);
      setLoading(false);

      if (data && Array.isArray(data.stores)) {
        setStores(data.stores);

        // Prepopulate current user ratings in local state
        const ratingsMap = {};
        data.stores.forEach((s) => {
          ratingsMap[s.id] = s.user_rating || 5;
        });
        setUserRatings((prev) => ({ ...ratingsMap, ...prev }));
      }
    },
    [token, searchName, searchAddress]
  );

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      const data = await getStores(token, "", "");
      if (!ignore) {
        if (data && Array.isArray(data.stores)) {
          setStores(data.stores);
          const ratingsMap = {};
          data.stores.forEach((s) => {
            ratingsMap[s.id] = s.user_rating || 5;
          });
          setUserRatings((prev) => ({ ...ratingsMap, ...prev }));
        }
        setLoading(false);
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, [token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUserStores(searchName, searchAddress);
  };

  const handleResetSearch = () => {
    setSearchName("");
    setSearchAddress("");
    fetchUserStores("", "");
  };

  const handleRatingChange = (storeId, newRating) => {
    setUserRatings((prev) => ({
      ...prev,
      [storeId]: newRating,
    }));
  };

  const handleRatingSubmit = async (store) => {
    const ratingValue = Number(userRatings[store.id] || store.user_rating || 5);

    if (!ratingValue || ratingValue < 1 || ratingValue > 5 || !Number.isInteger(ratingValue)) {
      onNotify("error", "Rating must be an integer between 1 and 5");
      return;
    }

    setSubmittingStoreId(store.id);
    let result;
    const isUpdate = Boolean(store.user_rating);

    if (isUpdate) {
      result = await updateRating(token, store.id, ratingValue);
    } else {
      result = await submitRating(token, store.id, ratingValue);
    }
    setSubmittingStoreId(null);

    if (result._ok || result.rating) {
      onNotify("success", isUpdate ? "Rating updated successfully!" : "Rating submitted successfully!");
      fetchUserStores(searchName, searchAddress);
    } else {
      onNotify("error", result.message || "Failed to submit rating");
    }
  };

  const sortedStores = [...stores].sort((a, b) => {
    if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "name-desc") return (b.name || "").localeCompare(a.name || "");
    if (sortBy === "address-asc") return (a.address || "").localeCompare(b.address || "");
    if (sortBy === "address-desc") return (b.address || "").localeCompare(a.address || "");
    if (sortBy === "rating-desc") return (Number(b.overall_rating) || 0) - (Number(a.overall_rating) || 0);
    if (sortBy === "rating-asc") return (Number(a.overall_rating) || 0) - (Number(b.overall_rating) || 0);
    if (sortBy === "myrating-desc") return (Number(b.user_rating) || 0) - (Number(a.user_rating) || 0);
    if (sortBy === "myrating-asc") return (Number(a.user_rating) || 0) - (Number(b.user_rating) || 0);
    return 0;
  });

  return (
    <div className="app-container">
      {/* Search and Filters Section */}
      <form
        onSubmit={handleSearchSubmit}
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
              onClick={handleResetSearch}
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
              type="submit"
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
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Search
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
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
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
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
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
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
              <option value="address-asc">Address (A to Z)</option>
              <option value="address-desc">Address (Z to A)</option>
              <option value="rating-desc">Overall Rating (High to Low)</option>
              <option value="rating-asc">Overall Rating (Low to High)</option>
              <option value="myrating-desc">My Rating (High to Low)</option>
              <option value="myrating-asc">My Rating (Low to High)</option>
            </select>
            <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }} width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </form>

      {/* Header for Stores List */}
      <div className="store-header">
        <h2>Stores ({sortedStores.length})</h2>
        <button
          type="button"
          className="refresh-btn"
          onClick={() => fetchUserStores(searchName, searchAddress)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "\u21BB Refresh"}
        </button>
      </div>

      {loading && stores.length === 0 ? (
        <div className="empty-state">Loading stores...</div>
      ) : sortedStores.length === 0 ? (
        <div className="empty-state">
          No stores found matching your search criteria. Try adjusting your filters.
        </div>
      ) : (
        <div className="store-grid">
          {sortedStores.map((store) => {
            const hasRated = Boolean(store.user_rating);
            const currentSelectedRating = userRatings[store.id] || store.user_rating || 5;
            const isSubmitting = submittingStoreId === store.id;

            return (
              <div key={store.id} className="store-card">
                <div>
                  <h3 className="store-title">{store.name}</h3>
                  <p className="store-address">📍 {store.address}</p>

                  <div className="rating-box">
                    <span className="rating-label">Overall Rating</span>
                    <StarRating value={store.overall_rating} readOnly={true} size={18} />
                  </div>

                  <div className="status-row">
                    <span className="status-label">Your Rating Status</span>
                    {hasRated ? (
                      <span className="status-badge rated">
                        Rated ({store.user_rating} ⭐)
                      </span>
                    ) : (
                      <span className="status-badge unrated">
                        Not yet rated
                      </span>
                    )}
                  </div>
                </div>

                <div className="action-section">
                  <div className="action-label-row">
                    <span className="action-label">
                      {hasRated ? "Update your rating:" : "Rate this store:"}
                    </span>
                    <StarRating
                      value={currentSelectedRating}
                      readOnly={false}
                      size={24}
                      onChange={(star) => handleRatingChange(store.id, star)}
                    />
                  </div>

                  <button
                    type="button"
                    className={"action-btn " + (hasRated ? "update" : "submit")}
                    onClick={() => handleRatingSubmit(store)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : hasRated
                      ? `Update to ${currentSelectedRating} ⭐`
                      : `Submit ${currentSelectedRating} ⭐`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
