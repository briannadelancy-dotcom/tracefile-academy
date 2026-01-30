import { defineConfig } from 'vite'

export default defineConfig({
  base: '/tracefile-academy/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})