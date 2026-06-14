import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { LoginPage } from "../../pages/login-page";
import { ProductPage } from "../../pages/product-page";
import { getCredentials } from "../helper/credentials";

const { Given, When, Then, Before } = createBdd();

let loginPage: LoginPage;
let productPage: ProductPage;

Before(async ({ page }) => {
  loginPage = new LoginPage(page);
  productPage = new ProductPage(page);
});

Given("I am on the login page", async () => {
  await loginPage.goto();
});

When("I sign in as {string} user", async ({}, role: string) => {
  const credentials = getCredentials(role as "standard" | "locked" | "slow");
  await loginPage.login(credentials.username, credentials.password);
});

When(
  "I sign in with username and empty password as {string} user",
  async ({}, role: string) => {
    const credentials = getCredentials(role as "standard" | "locked" | "slow");
    await loginPage.login(credentials.username, "");
  }
);

When(
  "I sign in with empty username and password as {string} user",
  async ({}, role: string) => {
    const credentials = getCredentials(role as "standard" | "locked" | "slow");
    await loginPage.login("", credentials.password);
  }
);

When(
  "I sign in with incorrect password as {string} user",
  async ({}, role: string) => {
    const credentials = getCredentials(role as "standard" | "locked" | "slow");
    await loginPage.login(credentials.username, "wrong_password");
  }
);

When("I click the error dismiss button", async () => {
  await loginPage.clearError();
});

When("I sign in using keyboard as {string} user", async ({}, role: string) => {
  const credentials = getCredentials(role as "standard" | "locked" | "slow");
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
