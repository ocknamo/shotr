import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  resolve: {},
  test: {
    name: "unit",
    setupFiles: ["./test/setup.ts"],
    exclude: [...defaultExclude],
    coverage: {
      provider: "istanbul",
    },
  },
});
