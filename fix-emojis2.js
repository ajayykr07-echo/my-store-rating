
const fs = require("fs");
let code = fs.readFileSync("frontend/src/components/UserView.jsx", "utf8");

code = code.replace(/\{\\uD83D\\uDCCD \} \{store\.address\}/g, "\"\\uD83D\\uDCCD \" + store.address");
fs.writeFileSync("frontend/src/components/UserView.jsx", code);

