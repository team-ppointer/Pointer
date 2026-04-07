import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'RepoPointerEditorV2',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.es.js' : 'index.cjs.js'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        exports: 'named',
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) => {
          const names = assetInfo.names || [];
          if (names.some((n) => n.endsWith('.css'))) {
            return 'style.css';
          }
          return '[name].[ext]';
        },
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // optional: inject global variables or mixins if needed
        additionalData: '',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/editor': path.resolve(__dirname, 'src/editor'),
    },
  },
});
