import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
    readonly productTitle: Locator;
    readonly productPrice: Locator;
    readonly productRating: Locator;
    readonly productReviewCount: Locator;
    readonly addToCartButton: Locator;
    readonly buyNowButton: Locator;
    readonly quantitySelector: Locator;
    readonly availability: Locator;
    readonly productImage: Locator;
    readonly productDescription: Locator;
    readonly addToWishlistButton: Locator;
    readonly compareCheckbox: Locator;

    constructor(page: Page) {
        super(page);
        this.productTitle = page.locator('h1 span[id^="productTitle"]');
        this.productPrice = page.locator('[data-a-color="price"]');
        this.productRating = page.locator('i[data-a-icon-star-count] span');
        this.productReviewCount = page.locator('[data-hook="see-all-reviews-link-foot"]');
        this.addToCartButton = page.locator('#add-to-cart-button');
        this.buyNowButton = page.locator('#buy-now-button');
        this.quantitySelector = page.locator('#quantity');
        this.availability = page.locator('#availability span');
        this.productImage = page.locator('img[data-old-hires]');
        this.productDescription = page.locator('#feature-bullets');
        this.addToWishlistButton = page.locator('input[aria-label*="Add to Wish List"]');
        this.compareCheckbox = page.locator('input[aria-label*="Compare"]');
    }

    async getProductTitle(): Promise<string> {
        return await this.productTitle.textContent() || '';
    }

    async getProductPrice(): Promise<string> {
        // Add a delay to ensure price is loaded
        await this.page.waitForTimeout(1000);
        
        // Use evaluate to extract price with multiple selector strategies
        const price = await this.page.evaluate(() => {
            // Strategy 1: Look for data-a-color="price" elements
            let priceElement = document.querySelector('[data-a-color="price"]');
            if (priceElement && priceElement.textContent) {
                const text = priceElement.textContent.trim();
                if (text) return text;
            }
            
            // Strategy 2: Look for price within a-price class
            priceElement = document.querySelector('.a-price-whole');
            if (priceElement && priceElement.textContent) {
                const text = priceElement.textContent.trim();
                if (text) return text;
            }
            
            // Strategy 3: Look for span containing currency symbol ($, £, €, etc.) with numbers
            const allSpans = document.querySelectorAll('span');
            for (let span of allSpans) {
                const text = span.textContent?.trim() || '';
                // Match patterns like $10.99, £50.00, etc.
                if (/[\$£€¥₹]?\d+[.,]\d{2}/.test(text)) {
                    return text;
                }
            }
            
            // Strategy 4: Look for elements with id containing "price"
            priceElement = document.querySelector('[id*="price"]');
            if (priceElement && priceElement.textContent) {
                const text = priceElement.textContent.trim();
                if (text && /\d/.test(text)) return text;
            }
            
            // Strategy 5: Look for -strikethrough-price-string class (sale price)
            priceElement = document.querySelector('.a-price-whole');
            if (priceElement && priceElement.textContent) {
                const text = priceElement.textContent.trim();
                if (text) return text;
            }
            
            return '';
        });
        
        return price || '';
    }

    async getRating(): Promise<string> {
        return await this.productRating.first().textContent() || '';
    }

    async getReviewCount(): Promise<string> {
        return await this.productReviewCount.textContent() || '';
    }

    async addToCart() {
        // Add a small delay to ensure the button is ready
        await this.page.waitForTimeout(500);
        
        try {
            // Check if add-to-cart button exists and is visible
            if (!await this.addToCartButton.isVisible({ timeout: 3000 })) {
                throw new Error('Add to Cart button not visible');
            }
            
            await this.addToCartButton.click();
            
            // Wait for either cart page or success notification
            // Use Promise.race to handle both scenarios without timing out
            await Promise.race([
                this.page.waitForURL(/.*\/gp\/cart.*/, { timeout: 5000 }).catch(() => null),
                this.page.waitForSelector('[data-feature-name="add-to-cart"]', { timeout: 5000 }).catch(() => null),
                this.page.waitForTimeout(2000)
            ]);
        } catch (error) {
            throw new Error(`Failed to add product to cart: ${error}`);
        }
    }

    async buyNow() {
        await this.buyNowButton.click();
    }

    async setQuantity(quantity: number) {
        await this.quantitySelector.selectOption(quantity.toString());
    }

    async getAvailability(): Promise<string> {
        return await this.availability.textContent() || '';
    }

    async isInStock(): Promise<boolean> {
        const availability = await this.getAvailability();
        return availability.includes('In Stock');
    }

    async addToWishlist() {
        await this.addToWishlistButton.click();
    }

    async verifyProductDetailsVisible(): Promise<boolean> {
        return await this.productTitle.isVisible() && await this.productPrice.isVisible();
    }

    async scrollToReviews() {
        await this.productReviewCount.scrollIntoViewIfNeeded();
    }

    async getProductImages(): Promise<number> {
        return await this.page.locator('img[alt*="product"]').count();
    }
}
