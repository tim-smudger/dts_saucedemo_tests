import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base-page";

export class ProductPage extends BasePage {
  readonly path = "/inventory.html";

  private readonly inventoryContainer: Locator;
  private readonly menuButton: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryContainer = page.locator('[data-test="inventory-container"]');
    this.menuButton = page.getByRole("button", { name: "Open Menu" });
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  async waitForLoaded(): Promise<void> {
    await this.page.waitForURL("/inventory.html");
    await this.inventoryContainer.waitFor();
  }

  get inventoryList(): Locator {
    return this.inventoryContainer;
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
