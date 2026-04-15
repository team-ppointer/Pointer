import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src/web',
  plugins: [viteSingleFile()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: Infinity,
  },
  server: {
    open: true,
  },
});
