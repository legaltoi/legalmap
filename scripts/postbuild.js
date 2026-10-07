const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

if (fs.existsSync(outDir)) {
  // 1. Assurer .nojekyll pour désactiver le traitement Jekyll de GitHub Pages
  const nojekyll = path.join(outDir, '.nojekyll');
  if (!fs.existsSync(nojekyll)) {
    fs.writeFileSync(nojekyll, '');
    console.log('[postbuild] Created .nojekyll');
  }

  // 2. Synchroniser admin.html <-> admin/index.html (compatibilité URL avec ou sans slash final)
  const adminDir = path.join(outDir, 'admin');
  const adminHtml = path.join(outDir, 'admin.html');
  const adminIndex = path.join(adminDir, 'index.html');

  if (fs.existsSync(adminIndex) && !fs.existsSync(adminHtml)) {
    fs.copyFileSync(adminIndex, adminHtml);
    console.log('[postbuild] Created admin.html from admin/index.html');
  } else if (fs.existsSync(adminHtml) && !fs.existsSync(adminIndex)) {
    if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true });
    fs.copyFileSync(adminHtml, adminIndex);
    console.log('[postbuild] Created admin/index.html from admin.html');
  }

  console.log('[postbuild] Completed successfully.');
} else {
  console.warn('[postbuild] out directory not found.');
}
