import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    fs: { strict: false }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  optimizeDeps: { exclude: [] }
});
