
const fs = require("fs");
let code = fs.readFileSync("frontend/src/components/AdminView.jsx", "utf8");

// Add deleteStore import
if (!code.includes("deleteStore")) {
  code = code.replace("addStore,\n  addUser,", "addStore,\n  deleteStore,\n  addUser,");
}

// Add handleDeleteStore function
if (!code.includes("handleDeleteStore")) {
  const handleAddStoreSubmitPos = code.indexOf("const handleAddStoreSubmit =");
  const deleteFunc = `
  const handleDeleteStore = async (storeId, storeName) => {
    if (!window.confirm(\`Are you sure you want to delete "\${storeName}"? This will also delete all its ratings.\`)) {
      return;
    }
    const res = await deleteStore(token, storeId);
    if (res.message === "Store deleted successfully") {
      onNotify("success", \`Store "\${storeName}" deleted.\`);
      fetchStores();
      fetchDashboardStats();
    } else {
      onNotify("error", res.message || "Failed to delete store");
    }
  };

  `;
  code = code.slice(0, handleAddStoreSubmitPos) + deleteFunc + code.slice(handleAddStoreSubmitPos);
}

// Add Actions header
if (!code.includes("<th>Actions</th>")) {
  code = code.replace(
    /Overall Rating \{renderSortIndicator\("rating", storeSort\)\}\s*<\/th>\s*<\/tr>/,
    `Overall Rating {renderSortIndicator("rating", storeSort)}
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: "600", color: "var(--gray-600)", fontSize: "12px", textTransform: "uppercase" }}>Actions</th>
                    </tr>`
  );
}

// Add Actions cell
if (!code.includes("Delete</button>")) {
  code = code.replace(
    /<StarRating value=\{store.rating\} readOnly=\{true\} size=\{16\} \/>\s*<\/td>\s*<\/tr>/g,
    `<StarRating value={store.rating} readOnly={true} size={16} />
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
                      </tr>`
  );
}

fs.writeFileSync("frontend/src/components/AdminView.jsx", code);

