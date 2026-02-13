import { config as dotenvConfig } from "dotenv";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Charger .env.test en priorité pour les tests, sinon .env
dotenvConfig({ path: ".env.test", override: true });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],

    // Test reporters (console + JSON file)
    reporters: ["default", "json"],
    outputFile: {
      json: "test-results/vitest/reports/vitest-report.json",
    },

    coverage: {
      enabled: true,
      provider: "v8",
      reportsDirectory: "test-results/vitest/coverage",
      reporter: ["json", "lcov", "text-summary"],
    },
  },

  // Avoid vite-tsconfig-paths (CJS) incompatibilities with modern Vite (ESM-only).
  // Keep the repo's TypeScript path aliases working for tests.
  resolve: {
    alias: [
      { find: /^@\/public\/(.*)$/, replacement: path.resolve(__dirname, "public") + "/$1" },
      { find: /^@\/web\/(.*)$/, replacement: path.resolve(__dirname, "src/app/(web)") + "/$1" },
      {
        find: /^@\/modules\/(.*)$/,
        replacement: path.resolve(__dirname, "src/lib/modules") + "/$1",
      },
      { find: /^@\/lib\/(.*)$/, replacement: path.resolve(__dirname, "src/lib") + "/$1" },
      { find: /^@\/app\/(.*)$/, replacement: path.resolve(__dirname, "src/app") + "/$1" },
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, "src") + "/$1" },
      { find: /^@$/, replacement: path.resolve(__dirname, "src") },
    ],
  },
});
