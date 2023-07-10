import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  resolve: {},
  test: {
    browser: {
      enabled: true,
      name: "chrome",
      headless: true,
    },
    name: "unit",
    setupFiles: ["./test/setup.ts"],
    exclude: [...defaultExclude],
  },
});
