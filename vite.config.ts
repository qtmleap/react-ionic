/// <reference types="vitest" />

import { resolve } from 'node:path'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
