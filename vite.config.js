import { defineConfig } from 'vite';
export default defineConfig({
  root: '.',
  base: './',
  server: { host: '0.0.0.0', proxy: { '/ws': { target: 'ws://localhost:3000', ws: true } } },
  build: { outDir: 'dist', emptyOutDir: true }
});