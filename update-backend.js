
const fs = require("fs");

let storeModel = fs.readFileSync("backend/models/storeModel.js", "utf8");
if (!storeModel.includes("deleteStore(storeId)")) {
  storeModel = storeModel.replace("class StoreModel {", "class StoreModel {\n  async deleteStore(storeId) {\n    await pool.query(\"DELETE FROM ratings WHERE store_id = $1\", [storeId]);\n    const result = await pool.query(\"DELETE FROM stores WHERE id = $1 RETURNING id\", [storeId]);\n    return result.rowCount > 0;\n  }\n");
  fs.writeFileSync("backend/models/storeModel.js", storeModel);
}

let adminController = fs.readFileSync("backend/controllers/adminController.js", "utf8");
if (!adminController.includes("async deleteStore(req, res)")) {
  adminController = adminController.replace("class AdminController {", "class AdminController {\n  async deleteStore(req, res) {\n    try {\n      const { id } = req.params;\n      if (!id) return res.status(400).json({ message: \"Store ID required\" });\n      const deleted = await storeModel.deleteStore(id);\n      if (!deleted) return res.status(404).json({ message: \"Store not found\" });\n      return res.json({ message: \"Store deleted successfully\" });\n    } catch (error) {\n      console.error(\"DELETE STORE ERROR:\", error);\n      return res.status(500).json({ message: \"Server error\" });\n    }\n  }\n");
  fs.writeFileSync("backend/controllers/adminController.js", adminController);
}

