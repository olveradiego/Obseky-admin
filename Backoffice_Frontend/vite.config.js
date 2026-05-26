/**
 * @filePurpose vite.config.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basadas en el modo actual
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: env.VITE_APP_TITLE || 'LoginAdmin Frontend',
          short_name: 'LoginAdmin',
          theme_color: '#0f766e',
          icons: [
            { src: '/vite.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: '/vite.svg', sizes: '512x512', type: 'image/svg+xml' },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3002',
          changeOrigin: true
        },
        '/images': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3002',
          changeOrigin: true
        },
      },
    },
  };
});

