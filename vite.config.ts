/**
 * Vite Configuration for MyFace SnapJournal
 * 
 * This config sets up React with TypeScript, enables HMR for development,
 * and configures the build for Tauri desktop app integration.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Clear screen on restart
  clearScreen: false,
  
  // Server configuration for development
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Watch for changes in src-tauri
      ignored: ['**/src-tauri/**']
    }
  },
  
  // Build configuration for Tauri
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@services': resolve(__dirname, 'src/services'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@database': resolve(__dirname, 'src/database')
    }
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})
