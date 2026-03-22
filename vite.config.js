import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to '/your-repo-name/' to match your GitHub repository name.
// Example: if your repo is github.com/username/learn-tracker → base: '/learn-tracker/'
export default defineConfig({
  plugins: [react()],
  base: '/learn-tracker/',
})
