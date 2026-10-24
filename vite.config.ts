import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/Blue-Bird-Enterprises-/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'dev-root-redirect-and-static-bundle',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
              res.writeHead(302, { Location: '/Blue-Bird-Enterprises-/' });
              res.end();
              return;
            }

            // Serve prebuilt gh-pages-bundle files directly as static assets so Vite does not run import-analysis on them
            const cleanUrl = (req.url || '').split('?')[0];
            const bundleMatch = cleanUrl.match(/(?:\/Blue-Bird-Enterprises-)?(?:\/public)?\/gh-pages-bundle\/([^/]+)$/);
            if (bundleMatch) {
              const fileName = bundleMatch[1];
              const filePath = path.resolve(import.meta.dirname, 'public', 'gh-pages-bundle', fileName);
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const contentType = fileName.endsWith('.css')
                  ? 'text/css; charset=utf-8'
                  : 'application/javascript; charset=utf-8';
                res.writeHead(200, { 'Content-Type': contentType });
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            }

            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
