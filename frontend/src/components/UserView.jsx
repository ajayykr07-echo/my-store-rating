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
      <form onSubmit={handleSearchSubmit} className="search-container">
        <div className="search-input-wrapper">
          <label className="search-label" htmlFor="searchName">Store Name</label>
          <input
            id="searchName"
            type="text"
            className="search-input"
            placeholder="e.g. Artisan Coffee"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <div className="search-input-wrapper">
          <label className="search-label" htmlFor="searchAddress">Store Address</label>
          <input
            id="searchAddress"
            type="text"
            className="search-input"
            placeholder="e.g. 123 Main St"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          />
        </div>

        <div className="search-input-wrapper">
          <label className="search-label" htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            className="search-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
        </div>

        <button type="submit" className="search-btn">
          Search
        </button>
        <button type="button" onClick={handleResetSearch} className="reset-btn">
          Reset
        </button>
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
