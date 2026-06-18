import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import dotenv from "dotenv";
import path from "path";
import { env } from "./environments";

dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

/**
 * playwright-bdd generates runnable specs from the .feature files into its own
 * output directory. `defineBddConfig` returns that path; functional projects
 * point their `testDir` at it so the generated tests are discovered.
 */
const bddDir = defineBddConfig({
  features: "tests/features/**/*.feature",
  steps: "tests/steps/**/*.ts",
  // ...other playwright-bdd options
});

/**
 * The accessibility suite is heavy and the same axe rules fire regardless of
 * engine, so we scan it on one desktop + one mobile viewport only. It lives in
 * tests/specs as hand-written Playwright specs; dedicated a11y projects own it.
 */
const a11yDir = "tests/specs";

/* Functional (BDD) browser matrix. Generated specs live in `bddDir`. */
const functionalProjects = [
  {
    name: "chromium",
    testDir: bddDir,
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "firefox",
    testDir: bddDir,
    use: { ...devices["Desktop Firefox"] },
  },
  {
    name: "webkit",
    testDir: bddDir,
    use: { ...devices["Desktop Safari"] },
  },
  /* Test against mobile viewports. */
  {
    name: "Mobile Chrome",
    testDir: bddDir,
    use: { ...devices["Pixel 9"] },
  },
  {
    name: "Mobile Safari",
    testDir: bddDir,
    use: { ...devices["iPhone 12"] },
  },
];

/* Accessibility scans: one desktop + one mobile viewport only. */
const a11yProjects = [
  {
    name: "a11y-desktop",
    testDir: a11yDir,
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "a11y-mobile",
    testDir: a11yDir,
    use: { ...devices["Pixel 9"] },
  },
];

/**
 * Named project sets. Select one with the SUITE env var; defaults to
 * `functional` so plain `npm test` skips the heavy a11y scans.
 */
const suites = {
  functional: functionalProjects,
  a11y: a11yProjects,
  all: [...functionalProjects, ...a11yProjects],
};

const suite = (process.env.SUITE ?? "functional") as keyof typeof suites;

export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: env.baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: !!process.env.CI,
  },

  /* Projects to run, chosen by the SUITE env var (see `suites` above). */
  projects: suites[suite] ?? suites.functional,

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
