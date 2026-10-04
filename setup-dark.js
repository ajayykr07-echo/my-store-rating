
const fs = require('fs');
const path = require('path');

const colorMap = {
  '#ffffff': '--white',
  '#f9fafb': '--gray-50',
  '#f3f4f6': '--gray-100',
  '#e5e7eb': '--gray-200',
  '#d1d5db': '--gray-300',
  '#9ca3af': '--gray-400',
  '#6b7280': '--gray-500',
  '#4b5563': '--gray-600',
  '#374151': '--gray-700',
  '#1f2937': '--gray-800',
  '#111827': '--gray-900',
  '#4f46e5': '--indigo-600',
  '#6366f1': '--indigo-500',
  '#7c3aed': '--violet-600',
  '#a855f7': '--purple-500',
  '#0284c7': '--sky-600',
  '#0369a1': '--sky-700',
  '#bae6fd': '--sky-200',
  '#f0f9ff': '--sky-50',
  '#eff6ff': '--blue-50',
  '#bfdbfe': '--blue-200',
  '#1e40af': '--blue-800',
  '#059669': '--emerald-600',
  '#065f46': '--emerald-800',
  '#a7f3d0': '--emerald-200',
  '#ecfdf5': '--emerald-50',
  '#ef4444': '--red-500',
  '#991b1b': '--red-800',
  '#fecaca': '--red-200',
  '#fef2f2': '--red-50',
  '#f59e0b': '--amber-500',
  '#92400e': '--amber-800',
  '#fde68a': '--amber-200',
  '#fffbeb': '--amber-50'
};

const darkMap = {
  '--white': '#0f172a',
  '--gray-50': '#1e293b',
  '--gray-100': '#334155',
  '--gray-200': '#475569',
  '--gray-300': '#64748b',
  '--gray-400': '#94a3b8',
  '--gray-500': '#cbd5e1',
  '--gray-600': '#e2e8f0',
  '--gray-700': '#f1f5f9',
  '--gray-800': '#f8fafc',
  '--gray-900': '#ffffff',
  '--indigo-600': '#818cf8',
  '--indigo-500': '#6366f1',
  '--violet-600': '#a78bfa',
  '--purple-500': '#c084fc',
  '--sky-600': '#38bdf8',
  '--sky-700': '#7dd3fc',
  '--sky-200': '#0369a1',
  '--sky-50': '#082f49',
  '--blue-50': '#172554',
  '--blue-200': '#1e40af',
  '--blue-800': '#bfdbfe',
  '--emerald-600': '#34d399',
  '--emerald-800': '#6ee7b7',
  '--emerald-200': '#064e3b',
  '--emerald-50': '#022c22',
  '--red-500': '#f87171',
  '--red-800': '#fca5a5',
  '--red-200': '#7f1d1d',
  '--red-50': '#450a0a',
  '--amber-500': '#fbbf24',
  '--amber-800': '#fcd34d',
  '--amber-200': '#78350f',
  '--amber-50': '#411900'
};

let css = ':root {\n';
for (const [hex, cssVar] of Object.entries(colorMap)) {
  css += '  ' + cssVar + ': ' + hex + ';\n';
}
css += '}\n\n.dark {\n';
for (const [cssVar, hex] of Object.entries(darkMap)) {
  css += '  ' + cssVar + ': ' + hex + ';\n';
}
css += '}\n';

fs.appendFileSync('frontend/src/index.css', '\n' + css);

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let text = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [hex, cssVar] of Object.entries(colorMap)) {
        // Find both lowercase and uppercase variations
        const regex = new RegExp(hex, 'gi');
        if (regex.test(text)) {
          text = text.replace(regex, 'var(' + cssVar + ')');
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, text);
        console.log('Updated ' + fullPath);
      }
    }
  }
}
processDir('frontend/src');
console.log('Done!');

