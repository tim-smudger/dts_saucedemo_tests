import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { LoginPage } from "../../pages/login-page";
import { ProductPage } from "../../pages/product-page";
import { getCredentials, type Role } from "../helper/credentials";

const { Given, When, Then, Before } = createBdd();

let loginPage: LoginPage;
let productPage: ProductPage;

Before(({ page }) => {
  loginPage = new LoginPage(page);
  productPage = new ProductPage(page);
});

Given("I am on the login page", async () => {
  await loginPage.goto();
});

When("I sign in as {string} user", async ({}, role: string) => {
  await loginPage.loginAs({ role: role as Role });
});

When(
  "I sign in with username and empty password as {string} user",
  async ({}, role: string) => {
    await loginPage.loginAs({
      role: role as Role,
      password: "",
    });
  },
);

When(
  "I sign in with empty username and password as {string} user",
  async ({}, role: string) => {
    await loginPage.loginAs({
      role: role as Role,
      username: "",
    });
  },
);

When(
  "I sign in with incorrect password as {string} user",
  async ({}, role: string) => {
    await loginPage.loginAs({
      role: role as Role,
      password: "wrong_password",
    });
  },
);

When("I click the error dismiss button", async () => {
  await loginPage.clearError();
});

When("I sign in using keyboard as {string} user", async ({}, role: string) => {
  const credentials = getCredentials(role as Role);
  await loginPage.loginViaKeyboard(credentials.username, credentials.password);
});

Then("I should be on the inventory page", async ({ page }) => {
  await expect(page).toHaveURL(/\/inventory\.html/);
});

Then("the inventory list should be visible", async () => {
  await expect(productPage.inventoryList).toBeVisible();
});

Then("I should see error {string}", async ({}, message: string) => {
  const errorText = await loginPage.getErrorMessage();
  expect(errorText).toBe(message);
});

Then("the error dismiss button should not be visible", async () => {
  const isVisible = await loginPage.isErrorButtonVisible();
  expect(isVisible).toBe(false);
});

When("I click the username error icon", async () => {
  await loginPage.clearUsernameErrorIcon();
});

When("I click the password error icon", async () => {
  await loginPage.clearPasswordErrorIcon();
});

Then("the username error icon should be visible", async () => {
  const isVisible = await loginPage.isUsernameErrorIconVisible();
  expect(isVisible).toBe(true);
});

Then("the username error icon should not be visible", async () => {
  const isVisible = await loginPage.isUsernameErrorIconVisible();
  expect(isVisible).toBe(false);
});

Then("the password error icon should be visible", async () => {
  const isVisible = await loginPage.isPasswordErrorIconVisible();
  expect(isVisible).toBe(true);
});

Then("the password error icon should not be visible", async () => {
  const isVisible = await loginPage.isPasswordErrorIconVisible();
  expect(isVisible).toBe(false);
});

When("I logout via the menu", async () => {
  await productPage.logout();
});

Then("I should be on the login page", async () => {
  await loginPage.waitForLoaded();
});
