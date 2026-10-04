
const fs = require("fs");
let code = fs.readFileSync("frontend/src/components/UserView.jsx", "utf8");

code = code.replace(/"\? Refresh"/g, "\"\\u21BB Refresh\"");
code = code.replace(/<p className="store-address">\?\? \{store\.address\}<\/p>/g, "<p className=\"store-address\">{\\uD83D\\uDCCD } {store.address}</p>");
code = code.replace(/Rated \(\{store\.user_rating\} \?\)/g, "Rated ({store.user_rating} \\u2B50)");
code = code.replace(/"Update to " \+ currentSelectedRating \+ " \?"/g, "\"Update to \" + currentSelectedRating + \" \\u2B50\"");
code = code.replace(/"Submit " \+ currentSelectedRating \+ " \?"/g, "\"Submit \" + currentSelectedRating + \" \\u2B50\"");

fs.writeFileSync("frontend/src/components/UserView.jsx", code);

