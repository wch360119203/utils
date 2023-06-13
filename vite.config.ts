import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'ES2015',
    sourcemap: true,
    lib: {
      entry: './src/main.ts',
      name: 'wch96-utils',
      fileName: 'utils',
      formats: ['umd', 'es'],
    },
  },
  plugins: [dts({ outputDir: './dist/types' })],
})
