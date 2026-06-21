import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login-page";
import { ProductPage } from "../../pages/product-page";
import AxeBuilder from "@axe-core/playwright";
import type { Result } from "axe-core";

let loginPage: LoginPage;
let productPage: ProductPage;

// Severities we treat as build-breaking. "moderate"/"minor" are reported but tolerated.
const BLOCKING_IMPACTS = ["critical", "serious"];

/** One line per violation: impact, rule id, count, help URL. */
function summarise(violations: Result[]): string {
  return violations
    .map((v) => `[${v.impact}] ${v.id} ×${v.nodes.length} — ${v.helpUrl}`)
    .join("\n");
}

test.beforeEach(({ page }) => {
  loginPage = new LoginPage(page);
  productPage = new ProductPage(page);
});

test.describe("Accessibility", { tag: "@accessibility" }, () => {
  test("login page has no critical or serious violations", async ({
    page,
  }, testInfo) => {
    await loginPage.goto();

    const results = await new AxeBuilder({ page }).analyze();

    // Always attach the full scan so the report has the complete picture.
    await testInfo.attach("axe-scan-login", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });

    const blocking = results.violations.filter((v) =>
      BLOCKING_IMPACTS.includes(v.impact ?? ""),
    );

    // Readable diff on failure instead of a 600-line object dump.
    expect(blocking, summarise(blocking)).toEqual([]);
  });

  test("product page has no critical or serious violations", async ({
    page,
  }, testInfo) => {
    await loginPage.goto();
    await loginPage.loginAs({ role: "standard" });
    await productPage.waitForLoaded();

    const results = await new AxeBuilder({ page }).analyze();

    await testInfo.attach("axe-scan-products", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });

    const blocking = results.violations.filter((v) =>
      BLOCKING_IMPACTS.includes(v.impact ?? ""),
    );

    expect(blocking, summarise(blocking)).toEqual([]);
  });
});
