import {test, expect, Page} from '@playwright/test';

export class BasePage {

    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(url: string) {
        await this.page.goto(url);
    }

    async verifyPageTitle(expectedTitle: string) {
        await expect(this.page).toHaveTitle(expectedTitle);
    }
}