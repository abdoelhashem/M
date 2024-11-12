import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // السماح بالوصول من جميع الأجهزة في نفس الشبكة
    port: 3000,        // يمكنك تغيير المنفذ إذا أردت
  },
})