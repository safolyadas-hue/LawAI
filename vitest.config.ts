import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    setupFiles: ['./setupTests.ts'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
