import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const hostname = process.env.PW_HOST ?? "127.0.0.1";
// Default to 3001 to avoid clashing with docker-compose binding 3000.
const port = Number(process.env.PW_PORT ?? "3001");
const baseUrl = process.env.BASE_URL ?? `http://${hostname}:${port}`;
const databaseUrl =
  process.env.PW_DATABASE_URL ??
  // When running on host, "db" (docker service) is not reachable; rewrite to localhost.
  process.env.DATABASE_URL?.replace(/@db(?=[:/])/, "@localhost");
// Allow easy local debugging: set PW_HEADLESS=0 to force headed mode
const isHeadless = process.env.PW_HEADLESS === "0" ? false : true;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  outputDir: "test-results/playwright/reports",
  use: {
    baseURL: baseUrl,
    headless: isHeadless,
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    launchOptions: {
      slowMo: 0,
      args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"],
    },
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer:
    process.env.SKIP_PLAYWRIGHT_WEB_SERVER === "1"
      ? undefined
      : {
          command:
            process.env.PW_WEB_SERVER_COMMAND ??
            `NEXT_TELEMETRY_DISABLED=1 ${databaseUrl ? `DATABASE_URL=${databaseUrl} ` : ""}next dev --turbo --hostname ${hostname} --port ${port}`,
          url: baseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
  projects: [
    {
      name: "Desktop Chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Desktop Firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Desktop WebKit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Test against mobile viewports. */
  // {
  //   name: 'Mobile Chrome',
  //   use: { ...devices['Pixel 5'] },
  // },
  // {
  //   name: 'Mobile Safari',
  //   use: { ...devices['iPhone 12'] },
  // },

  /* Test against branded browsers. */
  // {
  //   name: 'Microsoft Edge',
  //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
  // },
  // {
  //   name: 'Google Chrome',
  //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
  // },

  reporter: [
    ["list"],
    [
      "html",
      { open: "never", outputFolder: "test-results/playwright/reports" },
    ],
    [
      "junit",
      { outputFile: "test-results/playwright/reports/junit-results.xml" },
    ],
  ],
});
