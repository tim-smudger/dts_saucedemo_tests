# SauceDemo Test Automation

End-to-end test automation for the [SauceDemo](https://www.saucedemo.com) web
application, focused on login functionality. Tests are written in
[Playwright](https://playwright.dev) with TypeScript, using the Page Object Model and
BDD-style scenarios (Gherkin) via [playwright-bdd](https://vitalets.github.io/playwright-bdd/),
plus automated accessibility scans with [axe](https://github.com/dequelabs/axe-core).

For the reasoning behind the design and a list of possible improvements, see
[DESIGN.md](DESIGN.md).

## Tech stack

- **Language:** TypeScript
- **Runner:** Playwright Test
- **BDD:** playwright-bdd (Gherkin `.feature` files)
- **Accessibility:** @axe-core/playwright
- **Quality:** ESLint + Prettier
- **CI:** GitHub Actions

## Prerequisites

- [Node.js](https://nodejs.org) 18+ (CI uses the current LTS)
- npm (bundled with Node)

## Setup

1. **Install dependencies**

   ```bash
   npm ci
   ```

2. **Install Playwright browsers**

   ```bash
   npx playwright install --with-deps
   ```

3. **Create a `.env` file**

   Credentials are read from environment variables and are not committed. Copy the
   example file and adjust if needed:

   ```bash
   cp .env.example .env
   ```

   SauceDemo's accepted usernames and shared password are public (listed on its login
   page), so the example values work out of the box:

   ```dotenv
   STANDARD_USER=standard_user
   LOCKED_USER=locked_out_user
   TIMEOUT_TEST_USER=performance_glitch_user
   PASSWORD_FOR_ALL=secret_sauce
   ```

## Running the tests

```bash
npm test                 # functional (BDD) suite — the default
npm run test:functional  # functional suite explicitly
npm run test:a11y        # accessibility scans only
npm run test:all         # functional + accessibility
```

Useful variations:

```bash
npm run test:headed      # run with a visible browser
npm run test:ui          # Playwright UI mode
npm run test:debug       # step-through debugging
```

### Suites and environments

The suite and target environment are selected via environment variables (the npm
scripts above set these for you):

- **`SUITE`** — `functional` (default), `a11y`, or `all`
- **`ENV`** — `production` (default), `staging`, or `local`

```bash
# Examples
SUITE=all npm test
npm run test:staging     # ENV=staging
npm run test:prod        # ENV=production
```

> Note: only `production` (`https://www.saucedemo.com`) is a real target. `staging` and
> `local` are illustrative examples of multi-environment support.

## Test coverage

**Functional (login)** — positive and negative:

- Successful login redirects to the inventory page
- Missing username / missing password validation errors
- Incorrect credentials error
- Error message can be dismissed
- Locked-out user is rejected
- Keyboard-only login
- Delayed ("slow") user still succeeds
- Field error icons (documents that the icons look clickable but only the X dismisses)
- Logout returns to the login page

Functional scenarios run across Chromium, Firefox, WebKit, and mobile Chrome/Safari
viewports.

**Accessibility** — axe scans of the login and product pages, failing on
`critical`/`serious` violations.

## Reporting

Playwright generates an HTML report after a run:

```bash
npx playwright show-report
```

On failure, traces (first retry) and screenshots are captured; accessibility scans
attach the full axe results to the report.

## Linting and formatting

```bash
npm run lint     # ESLint
npm run format   # Prettier (write)
```

## Continuous integration

[GitHub Actions](.github/workflows/playwright.yml) runs lint, functional, and
accessibility jobs in parallel on every push and pull request, uploading the HTML
report as an artifact. Credentials are injected from repository secrets.

On pushes to `main`, a `publish-report` job merges the functional and accessibility
results into a single HTML report and deploys it to **GitHub Pages**, so the latest run
is browsable at a URL without downloading artifacts.

> One-time setup: in the repository **Settings → Pages**, set the source to
> **GitHub Actions**. The job uses the official Pages deployment and needs no extra
> secrets.

## Project structure

```
pages/                 Page objects (BasePage + LoginPage + ProductPage)
tests/features/        Gherkin .feature files
tests/steps/           Step definitions
tests/specs/           Hand-written specs (accessibility)
tests/helper/          Test-data helpers (credentials)
environments.ts        Per-environment config (baseURL + users)
playwright.config.ts   Playwright + BDD + suite/project configuration
```
