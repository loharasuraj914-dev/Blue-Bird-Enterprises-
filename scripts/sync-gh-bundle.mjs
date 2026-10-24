import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distAssetsDir = path.join(rootDir, 'dist', 'assets');
const outDir = path.join(rootDir, 'public', 'gh-pages-bundle');
const distFallbackDir = path.join(rootDir, 'dist', 'gh-pages-bundle');
const distPublicFallbackDir = path.join(rootDir, 'dist', 'public', 'gh-pages-bundle');

if (fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(distFallbackDir, { recursive: true });
  fs.mkdirSync(distPublicFallbackDir, { recursive: true });

  // Clean previous hashed chunk files in public/gh-pages-bundle before syncing fresh build output
  for (const existing of fs.readdirSync(outDir)) {
    const existingPath = path.join(outDir, existing);
    if (fs.statSync(existingPath).isFile() && (existing.endsWith('.js') || existing.endsWith('.css'))) {
      fs.unlinkSync(existingPath);
    }
  }

  const files = fs.readdirSync(distAssetsDir);

  // Copy ALL .js and .css chunks (including html2canvas-*.js, purify.es-*.js, index.es-*.js, __vite-browser-external-*.js, index-*.js, index-*.css)
  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.css')) {
      const srcPath = path.join(distAssetsDir, file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, path.join(outDir, file));
        fs.copyFileSync(srcPath, path.join(distFallbackDir, file));
        fs.copyFileSync(srcPath, path.join(distPublicFallbackDir, file));
      }
    }
  }

  const jsFile = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
  const cssFile = files.find((f) => f.startsWith('index-') && f.endsWith('.css'));
  const html2canvasFile = files.find((f) => f.startsWith('html2canvas-') && f.endsWith('.js'));

  if (jsFile) {
    const srcJs = path.join(distAssetsDir, jsFile);
    fs.copyFileSync(srcJs, path.join(outDir, 'app.js'));
    fs.copyFileSync(srcJs, path.join(distFallbackDir, 'app.js'));
    fs.copyFileSync(srcJs, path.join(distPublicFallbackDir, 'app.js'));
  }

  // Ensure html2canvas-D2J88eqY.js is also present using the real compiled html2canvas chunk
  if (html2canvasFile && jsFile) {
    const rawHtml2Canvas = fs.readFileSync(path.join(distAssetsDir, html2canvasFile), 'utf-8');
    const normalizedHtml2Canvas = rawHtml2Canvas.replaceAll(`./${jsFile}`, './app.js');
    for (const targetDir of [outDir, distFallbackDir, distPublicFallbackDir]) {
      const legacyChunkPath = path.join(targetDir, 'html2canvas-D2J88eqY.js');
      if (!fs.existsSync(legacyChunkPath)) {
        fs.writeFileSync(legacyChunkPath, normalizedHtml2Canvas, 'utf-8');
      }
    }
  }

  if (cssFile) {
    const srcCss = path.join(distAssetsDir, cssFile);
    fs.copyFileSync(srcCss, path.join(outDir, 'app.css'));
    fs.copyFileSync(srcCss, path.join(distFallbackDir, 'app.css'));
    fs.copyFileSync(srcCss, path.join(distPublicFallbackDir, 'app.css'));
  }

  console.log('Synced GitHub Pages bundle and all companion chunks to public/gh-pages-bundle/');
}

