import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distAssetsDir = path.join(rootDir, 'dist', 'assets');
const outDir = path.join(rootDir, 'public', 'gh-pages-bundle');

if (fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(distAssetsDir);

  const jsFile = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
  const cssFile = files.find((f) => f.startsWith('index-') && f.endsWith('.css'));

  if (jsFile) {
    fs.copyFileSync(
      path.join(distAssetsDir, jsFile),
      path.join(outDir, 'app.js')
    );
  }
  if (cssFile) {
    fs.copyFileSync(
      path.join(distAssetsDir, cssFile),
      path.join(outDir, 'app.css')
    );
  }

  // Also copy into dist/public/gh-pages-bundle so dist has it too
  const distFallbackDir = path.join(rootDir, 'dist', 'gh-pages-bundle');
  fs.mkdirSync(distFallbackDir, { recursive: true });
  if (jsFile) {
    fs.copyFileSync(
      path.join(distAssetsDir, jsFile),
      path.join(distFallbackDir, 'app.js')
    );
  }
  if (cssFile) {
    fs.copyFileSync(
      path.join(distAssetsDir, cssFile),
      path.join(distFallbackDir, 'app.css')
    );
  }

  console.log('Synced GitHub Pages fallback bundle to public/gh-pages-bundle/');
}
