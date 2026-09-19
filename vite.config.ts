import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      // The pdf.js worker is consumed as a static ?url asset, not as an
      // optimizable JS dependency — keep the dep optimizer away from it.
      exclude: ['pdfjs-dist/build/pdf.worker.min.mjs'],
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // Allow the sandbox preview host (e.g. 3000-xxxx.e2b.app) so the app is
      // reachable when running inside an agent/e2b environment.
      allowedHosts: ['.e2b.app', '.e2b.codes', '.localhost'],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
