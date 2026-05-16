import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Don’t trigger HMR when files in backend/ change
      ignored: ['**/backend/**'],
    },
    allowedHosts: [".loca.lt", "localhost"]
  },
})
