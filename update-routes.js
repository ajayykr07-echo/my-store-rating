
const fs = require("fs");
let adminRoutes = fs.readFileSync("backend/routes/admin.js", "utf8");
if (!adminRoutes.includes("router.delete(\"/stores/:id\"")) {
  adminRoutes = adminRoutes.replace("router.get(\"/stores\", adminController.getStores);", "router.get(\"/stores\", adminController.getStores);\nrouter.delete(\"/stores/:id\", adminController.deleteStore);");
  fs.writeFileSync("backend/routes/admin.js", adminRoutes);
}

