import {Page,Locator, expect} from '@playwright/test';
import {BasePage} from './BasePage';

export class HomePage extends BasePage {
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly cartIcon: Locator;
    readonly addToCartButton: Locator;
    readonly cartpageUrl : Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput = page.getByRole('searchbox');
        this.searchButton = page.locator('#nav-search-submit-button');
        this.cartIcon = page.locator('span.nav-cart-icon.nav-sprite');
        this.addToCartButton = page.locator('button').filter({ hasText: 'Add to cart' }).last();
        this.cartpageUrl = page.locator('a[href*="/gp/cart"]');
    }

    async navigateToHomePage() {
        await this.navigateTo('https://www.amazon.com/');
    }

    async searchForProduct(productName: string) {
        await this.searchInput.fill(productName);
        await this.searchButton.click();
    }

    async addToCartAndNavigateToCart() {
        // Click Add to Cart - automatically redirects to cart page
        await this.addToCartButton.click();
        // await this.page.waitForLoadState('load');
    }

    async searchAndAddToCart(productName: string) {
        await this.searchForProduct(productName);
        await this.addToCartAndNavigateToCart();
    }

    async clickCartIcon() {
        await this.cartIcon.click();
        
    }

    async getCartPageUrl() {
        return this.page.url();
    }

   
}