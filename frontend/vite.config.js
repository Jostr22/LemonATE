import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` permite publicar en GitHub Pages (https://usuario.github.io/LemonATE/)
// sin depender del nombre exacto del repositorio.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    // Permite importar las reglas compartidas de ../shared durante el desarrollo.
    fs: { allow: ['..'] },
  },
});
