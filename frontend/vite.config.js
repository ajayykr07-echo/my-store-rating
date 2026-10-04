import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'fix-mime-types',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const origSetHeader = res.setHeader.bind(res);
          res.setHeader = function (key, val) {
            if (
              typeof key === 'string' &&
              key.toLowerCase() === 'content-type' &&
              typeof val === 'string' &&
              val.includes('application/octet-stream')
            ) {
              const url = req.url ? req.url.split('?')[0] : '';
              if (/\.(js|mjs|jsx|ts|tsx)$/.test(url)) {
                return origSetHeader('Content-Type', 'text/javascript');
              }
            }
            return origSetHeader(key, val);
          };
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const origSetHeader = res.setHeader.bind(res);
          res.setHeader = function (key, val) {
            if (
              typeof key === 'string' &&
              key.toLowerCase() === 'content-type' &&
              typeof val === 'string' &&
              val.includes('application/octet-stream')
            ) {
              const url = req.url ? req.url.split('?')[0] : '';
              if (/\.(js|mjs|jsx|ts|tsx)$/.test(url)) {
                return origSetHeader('Content-Type', 'text/javascript');
              }
            }
            return origSetHeader(key, val);
          };
          next();
        });
      },
    },
  ],
})

