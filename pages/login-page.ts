import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";
import { getCredentials } from "../tests/helper/credentials";

export class LoginPage extends BasePage {
  readonly path = "/";

  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly errorButton: Locator;
  private readonly errorText: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameField = page.locator('[data-test="username"]');
    this.passwordField = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorText = page.locator('[data-test="error"]');
    this.errorButton = page.locator('button[data-test="error-button"]');
  }

  protected async waitForLoaded(): Promise<void> {
    await this.page.waitForURL("/");
    await this.usernameField.waitFor();
  }

  async login(username: string = "", password: string = ""): Promise<void> {
    if (username) {
      await this.usernameField.fill(username);
    }
    if (password) {
      await this.passwordField.fill(password);
    }
    await this.loginButton.click();
  }

  async loginViaKeyboard(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.usernameField.press("Tab");
    await this.passwordField.fill(password);
    await this.passwordField.press("Enter");
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorText.innerText();
  }

  async clearError(): Promise<void> {
    await this.errorButton.click();
  }

  async isErrorButtonVisible(): Promise<boolean> {
    return await this.errorButton.isVisible();
  }

  async loginAs(options: {
    role?: "standard" | "locked" | "slow";
    username?: string;
    password?: string;
  } = {}): Promise<void> {
    let username = options.username;
    let password = options.password;

    if (options.role) {
      const credentials = getCredentials(options.role);
      username ??= credentials.username;
      password ??= credentials.password;
    }

    await this.login(username || "", password || "");
  }
}
