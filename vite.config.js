import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel auto-detects this preset — no extra Vercel config needed.
// Output goes to dist/ (Vite default), which Vercel serves as a static site.
export default defineConfig({
  plugins: [react()],
});
