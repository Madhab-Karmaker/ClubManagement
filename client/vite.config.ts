import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward every /api/* request to the ASP.NET Core backend
      '/api': {
        target: 'https://localhost:7065',
        changeOrigin: true,
        secure: false,   // accept the dev self-signed certificate
      },
    },
  },
})
