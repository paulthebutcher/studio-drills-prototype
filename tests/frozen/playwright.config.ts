import { defineConfig, devices } from "@playwright/test";

// FROZEN runner config (Fix 1), Studio Drills baseline SD-B2. Lives inside
// tests/frozen/ so the freeze hash covers it. Runs serially against a dedicated
// test database on port 3100 and never reuses a running server, so the suite
// cannot write into Paul's practice log (architecture §5, [AC-15]).
export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  globalSetup: "./global-setup.ts",
  use: {
    baseURL: "http://localhost:3100",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DATABASE_URL: "file:./test.db", STUDIO_DRILLS_TEST_RESET: "1" },
  },
});
