import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import serverAdapter from 'hono-react-router-adapter/vite';

export default defineConfig({
  
  plugins: [
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths(),
    serverAdapter({
    entry: 'server/router.ts',
  }),],
    test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./vitest.global-setup.ts'],
  },
});
