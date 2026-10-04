
const fs = require("fs");
let code = fs.readFileSync("frontend/src/components/UserView.jsx", "utf8");

const idx = code.lastIndexOf("\n  return (");
if (idx !== -1) {
  code = code.substring(0, idx) + `\n  return (
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
          {loading ? "Refreshing..." : "? Refresh"}
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
                  <p className="store-address">?? {store.address}</p>

                  <div className="rating-box">
                    <span className="rating-label">Overall Rating</span>
                    <StarRating value={store.overall_rating} readOnly={true} size={18} />
                  </div>

                  <div className="status-row">
                    <span className="status-label">Your Rating Status</span>
                    {hasRated ? (
                      <span className="status-badge rated">
                        Rated ({store.user_rating} ?)
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
                      ? "Update to " + currentSelectedRating + " ?"
                      : "Submit " + currentSelectedRating + " ?"}
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
`;
  fs.writeFileSync("frontend/src/components/UserView.jsx", code);
  console.log("Done");
}

