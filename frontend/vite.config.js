import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< HEAD
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
=======
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'postfetal-marlena-uncontemplatively.ngrok-free.dev'
    ]
  }
})
>>>>>>> c9a79b499e3fdc4446053d3a98c78f295404779a
