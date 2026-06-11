import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // When deployed to GitHub Pages the repo name becomes the base path.
  // Set VITE_BASE env var to override (e.g. '/' for the Docker container).
  base: process.env.VITE_BASE ?? '/die-die/',
})
