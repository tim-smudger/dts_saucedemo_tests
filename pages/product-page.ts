import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base-page";

export class ProductPage extends BasePage {
  readonly path = "/inventory.html";

  private readonly inventoryContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryContainer = page.locator('[data-test="inventory-container"]');
  }

  protected async waitForLoaded(): Promise<void> {
    await this.page.waitForURL("/inventory.html");
    await this.inventoryContainer.waitFor();
  }

  get inventoryList(): Locator {
    return this.inventoryContainer;
  }
}
