import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";
import { getCredentials, type Role } from "../tests/helper/credentials";

export class LoginPage extends BasePage {
  readonly path = "/";

  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly errorMesssageButton: Locator;
  private readonly errorMessageText: Locator;
  private readonly usernameErrorIcon: Locator;
  private readonly passwordErrorIcon: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameField = page.locator('[data-test="username"]');
    this.passwordField = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessageText = page.locator('[data-test="error"]');
    this.errorMesssageButton = page.locator('button[data-test="error-button"]');
    this.usernameErrorIcon = page.locator(
      '[data-test="username"] ~ svg.error_icon',
    );
    this.passwordErrorIcon = page.locator(
      '[data-test="password"] ~ svg.error_icon',
    );
  }

  async waitForLoaded(): Promise<void> {
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

  async clearUsernameErrorIcon(): Promise<void> {
    return await this.usernameErrorIcon.click();
  }

  async clearPasswordErrorIcon(): Promise<void> {
    return await this.passwordErrorIcon.click();
  }

  async isUsernameErrorIconVisible(): Promise<boolean> {
    return await this.usernameErrorIcon.isVisible();
  }

  async isPasswordErrorIconVisible(): Promise<boolean> {
    return await this.passwordErrorIcon.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessageText.innerText();
  }

  async clearError(): Promise<void> {
    await this.errorMesssageButton.click();
  }

  async isErrorButtonVisible(): Promise<boolean> {
    return await this.errorMesssageButton.isVisible();
  }

  async loginAs(
    options: {
      role?: Role;
      username?: string;
      password?: string;
    } = {},
  ): Promise<void> {
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
