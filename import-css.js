
const fs = require("fs");
let code = fs.readFileSync("frontend/src/App.jsx", "utf8");
code = "import \"./App.css\";\n" + code;
fs.writeFileSync("frontend/src/App.jsx", code);

