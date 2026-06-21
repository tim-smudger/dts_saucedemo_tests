# Design

This document explains the design decisions behind this test automation framework,
the trade-offs involved, and the improvements I would make with more time. It is
intended as a companion to the README, which covers setup and execution.

## Goal and scope

The brief is to automate the login functionality of a web application, covering both
positive and negative scenarios with proper data management, wait strategies,
assertions and reporting. The application under test is
[SauceDemo](https://www.saucedemo.com), a public e-commerce demo site whose login page
exposes a useful range of behaviours (valid login, locked-out users, validation errors,
a deliberately slow user) that make it well suited to demonstrating a range of test
techniques.

## Technology choices

| Choice | Reason |
|---|---|
| **TypeScript** | Static typing catches selector/credential mistakes at compile time and makes the page objects self-documenting. |
| **Playwright** | Fast, cross-browser by default, with auto-waiting that removes most flaky-wait boilerplate. First-class trace viewer, HTML reporter and accessibility tooling. |
| **playwright-bdd** | Lets scenarios be written in Gherkin (`.feature` files) while still running on the Playwright runner — so business-readable specs sit on top of Playwright's tooling rather than replacing it. |
| **@axe-core/playwright** | Adds automated accessibility scanning, which is a core HMCTS concern (public services must meet WCAG). |
| **ESLint + Prettier** | Enforce consistent style and catch unused code; both run in CI. |

## Architecture

The framework is built around three layers, kept deliberately separate so that a change
in one rarely forces a change in another.

```
tests/features/*.feature      ← Gherkin: business-readable scenarios (the "what")
        │
tests/steps/*.steps.ts        ← Step definitions: glue (the "how it's driven")
        │
pages/*.ts                    ← Page Objects: UI interaction + locators (the "where")
        │
environments.ts / credentials.ts ← Test data and configuration
```

### 1. Page Object Model

All UI interaction is encapsulated in page objects under [pages/](pages/). Tests never
touch a raw selector; they call intention-revealing methods such as
`loginPage.loginAs({ role: "standard" })` or `productPage.logout()`.

- [BasePage](pages/base-page.ts) is an abstract base holding the shared `page`
  reference, a `goto()` that navigates to each page's declared `path` and waits for it
  to load, and a default `waitForLoaded()`. Concrete pages declare their own `path` and
  override `waitForLoaded()` with a page-specific readiness check.
- [LoginPage](pages/login-page.ts) and [ProductPage](pages/product-page.ts) extend it.
  Locators are private and assigned once in the constructor, so the selector for an
  element exists in exactly one place. If SauceDemo's markup changes, the fix is a
  one-line change in the relevant page object.

This is the central design pattern: it keeps tests readable, removes duplication, and
isolates the brittle part of any UI suite (selectors) behind a stable API.

### 2. BDD / Gherkin layer

Scenarios live in [tests/features/login.feature](tests/features/login.feature) and read
as plain English, which makes the intended behaviour reviewable by non-engineers (BAs,
POs). Step definitions in [tests/steps/login.steps.ts](tests/steps/login.steps.ts)
translate each step into page-object calls. Page objects are instantiated per scenario
in a `Before` hook, giving each scenario a clean, isolated state.

### 3. Test data and configuration

- [environments.ts](environments.ts) defines named environments (`production`,
  `staging`, `local`), each with a `baseURL` and a user set. The active environment is
  chosen at runtime via the `ENV` variable and validated on load, failing fast with a
  clear message on an unknown value.
  > **Note:** Only `production` (`https://www.saucedemo.com`) is a real, working target.
  > The `staging` and `local` entries are illustrative examples showing how the framework
  > would support multiple environments — those URLs do not point at real deployments.
- [tests/helper/credentials.ts](tests/helper/credentials.ts) resolves a role
  (`standard` / `locked` / `slow`) to a username/password pair by reading directly from
  the active environment's `users` map — so test data has a single source of truth in
  [environments.ts](environments.ts) rather than being duplicated. It also exports the
  shared `Role` type used across the page objects and steps.
- **No credentials are committed.** All usernames and the shared password are read from
  environment variables (`.env` locally, GitHub Actions secrets in CI). This keeps
  secrets out of version control and lets the same suite run against different
  environments without code changes.

## Wait strategies, assertions and error handling

- **Auto-waiting:** Playwright actions (`click`, `fill`, `waitFor`) auto-wait for
  elements to be actionable, so there are no fixed `sleep`s.
- **Explicit readiness:** each page's `waitForLoaded()` waits on a URL *and* a key
  element (e.g. the inventory container) before a test proceeds, which is what makes the
  "slow user" scenario pass reliably without arbitrary timeouts.
- **Web-first assertions:** `expect(locator).toBeVisible()` / `toHaveURL()` retry until
  the condition holds or times out, removing a common source of flakiness.
- **Retries:** configured to retry twice on CI only (see
  [playwright.config.ts](playwright.config.ts)), so transient infra blips don't fail a
  run while local failures stay loud and immediate.

## Coverage

**Functional (login)** — positive and negative:
- Successful login → redirect to inventory
- Missing username / missing password validation errors
- Incorrect credentials error
- Error message can be dismissed
- Locked-out user is rejected
- Keyboard-only login (Tab/Enter)
- Delayed ("slow") user still succeeds
- Logout returns to the login page

**Cross-browser / responsive** — functional scenarios run on Chromium, Firefox, WebKit,
plus mobile Chrome and mobile Safari viewports.

**Accessibility** — [accessibility.spec.ts](tests/specs/accessibility.spec.ts) runs axe
scans on the login and product pages and fails the build on `critical`/`serious`
violations, while attaching the full scan to the report for context.

## Reporting

- Playwright's **HTML reporter** produces a browsable report; traces are captured on the
  first retry and screenshots on failure for fast diagnosis.
- The accessibility spec **attaches the full axe JSON** to each test and prints a
  one-line-per-violation summary on failure, so a failing scan is readable rather than a
  600-line object dump.
- In CI, reports are uploaded as artifacts (30-day retention).

## Continuous integration

[.github/workflows/playwright.yml](.github/workflows/playwright.yml) runs three parallel
jobs on every push/PR: **lint**, **functional-tests**, and **accessibility-tests**.
Functional and a11y are split so a styling/a11y regression and a functional regression
are reported independently, and each uploads its own report artifact. Credentials are
injected from repository secrets.

## Test suites and environments

Project sets are grouped into named suites (`functional`, `a11y`, `all`) selected via the
`SUITE` variable, and environments via `ENV`. `npm test` defaults to the functional
suite against production so the common case is fast and the heavy a11y scans are opt-in.

## Known gaps and possible improvements

Given more time I would:

1. **Expand beyond login.** Add cart/checkout journeys to exercise the page-object model
   more fully and demonstrate end-to-end flows.
2. **Data-driven negative cases.** Use Scenario Outlines/Examples tables to cover
   validation permutations more concisely.
3. **Richer reporting.** Integrate an Allure or similar trend report, and consider
   publishing the HTML report to GitHub Pages from CI.
4. **API/state setup.** Where the app allowed it, set up state via API rather than the UI
   to make tests faster and less brittle.
5. **Visual and contract checks.** Add visual-regression snapshots for the login page and
   consider tagging/sharding to keep the cross-browser matrix fast as the suite grows.
6. **Accessibility depth.** Extend axe scans to all routes and add focus-order/keyboard-
   trap assertions beyond the single keyboard-login scenario.

## A note on the `@fail` scenarios

The feature file contains two `@fail`-tagged scenarios for the username/password error
icons. These are **deliberate expected-failure tests**, not unfinished ones.

The field error icons look clickable but are inert — only the error banner's dismiss (X)
button clears the error. The scenarios assert the *intuitive* behaviour (clicking an icon
dismisses its error) and tag it `@fail`, which playwright-bdd maps to Playwright's
`test.fail()`. The effect:

- While the app doesn't support it, the assertion fails, `test.fail()` treats that as the
  expected outcome, and the build stays green.
- If the app were ever changed so the icon *did* clear the error, the test would
  unexpectedly pass and `@fail` would fail the build — flagging that the documented gap
  has closed and the test should be updated.

This documents a real UX quirk as living, self-checking specification rather than a
comment. The companion (non-`@fail`) scenario verifies the supported path: the dismiss
button clears both field icons.
