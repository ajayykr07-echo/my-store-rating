
const fs = require('fs');
let css = fs.readFileSync('frontend/src/index.css', 'utf8');
css = css.replace('.dark {', '.dark {\n  --primary: var(--indigo-600);\n  --primary-hover: var(--indigo-500);\n  --bg-main: #020617;\n  --card-bg: var(--white);\n  --text-main: var(--gray-900);\n  --text-muted: var(--gray-500);\n  --border-color: var(--gray-200);');
fs.writeFileSync('frontend/src/index.css', css);

