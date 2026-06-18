import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Amazon Product Flow', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.navigateToHomePage();
    });

    test('should navigate to Amazon homepage successfully', async ({ page }) => {
       
        await expect(page.locator('#nav-logo-sprites')).toBeVisible(); // Check for Amazon logo
    });

    test('should search for a product and display results', async () => {
        const productName = 'Laptop';
        await homePage.searchForProduct(productName);
        // Verify that search results are displayed
        await expect(homePage.page.locator('span.a-color-state.a-text-bold')).toContainText(productName);
       

    });

    test('should search for a product and add it to cart', async () => {
        const productName = 'Laptop';
        await homePage.searchAndAddToCart(productName);
        // Verify that the product was added to the cart
        await expect(homePage.page.locator('#nav-cart-count')).toHaveCount(1); // Cart count should be 1
       

    });

    test('should navigate to cart page when cart icon is clicked', async () => {
        const productName = 'Laptop';
        await homePage.searchAndAddToCart(productName);
        await homePage.clickCartIcon();
        await expect(homePage.page).toHaveURL(/.*\/gp\/cart.*/);
    });
});