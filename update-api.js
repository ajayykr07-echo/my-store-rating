
const fs = require("fs");
let apiJs = fs.readFileSync("frontend/src/api.js", "utf8");
if (!apiJs.includes("deleteStore(")) {
  apiJs += `\nexport async function deleteStore(token, storeId) {\n  return request(\`/admin/stores/\${storeId}\`, {\n    method: "DELETE",\n    headers: { Authorization: \`Bearer \${token}\` },\n  });\n}\n`;
  fs.writeFileSync("frontend/src/api.js", apiJs);
}

