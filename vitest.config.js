import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node environment is enough for the script helpers. Switch the relevant
    // file's environment to 'jsdom' (and install it) if you add DOM-based
    // component tests.
    environment: 'node',
    include: ['**/*.test.{js,mjs,jsx}'],
  },
});
