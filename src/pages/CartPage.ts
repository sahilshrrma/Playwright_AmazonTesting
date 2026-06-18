import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
    readonly cartItems: Locator;
    readonly cartItemTitle: Locator;
    readonly cartItemPrice: Locator;
    readonly cartItemQuantity: Locator;
    readonly cartItemDeleteButton: Locator;
    readonly cartSubtotal: Locator;
    readonly cartTotal: Locator;
    readonly proceedToCheckoutButton: Locator;
    readonly emptyCartMessage: Locator;
    readonly cartCount: Locator;
    readonly quantityInput: Locator;
    readonly saveForLaterButton: Locator;
    readonly updateButton: Locator;

    constructor(page: Page) {
        super(page);
        this.cartItems = page.locator('[data-item-index]');
        this.cartItemTitle = page.locator('span.a-truncate-cut');
        this.cartItemPrice = page.locator('[data-a-color="price"]');
        this.cartItemQuantity = page.locator('input[type="number"]');
        this.cartItemDeleteButton = page.locator('[aria-label*="Delete"]');
        this.cartSubtotal = page.locator('span.a-price-whole');
        this.cartTotal = page.locator('#sc-subtotal-amount-buybox');
        this.proceedToCheckoutButton = page.locator('[name="proceedToRetailCheckout"]');
        this.emptyCartMessage = page.locator('text=Your Amazon Cart is empty');
        this.cartCount = page.locator('#nav-cart-count');
        this.quantityInput = page.locator('input[aria-label*="Quantity"]');
        this.saveForLaterButton = page.locator('[aria-label*="Save for later"]');
        this.updateButton = page.locator('[name="update"]');
    }

    async getCartItemCount(): Promise<number> {
        // Add a delay to ensure cart content is loaded
        await this.page.waitForTimeout(1000);
        
        // Use evaluate to get item count from the page
        const count = await this.page.evaluate(() => {
            // Strategy 1: Look for cart item containers
            let items = document.querySelectorAll('[data-item-index]');
            if (items.length > 0) return items.length;
            
            // Strategy 2: Look for cart-item divs
            items = document.querySelectorAll('[data-name*="CartItem"]');
            if (items.length > 0) return items.length;
            
            // Strategy 3: Look for divs with cart item structure (specific ASIN)
            items = document.querySelectorAll('[data-asin]');
            if (items.length > 0) return items.length;
            
            // Strategy 4: Count visible cart item elements by looking for delete buttons (one per item)
            const deleteButtons = document.querySelectorAll('[aria-label*="Delete"]');
            if (deleteButtons.length > 0) return deleteButtons.length;
            
            // Strategy 5: Look for elements with class containing 'cart-item'
            items = document.querySelectorAll('[class*="cart-item"]');
            if (items.length > 0) return items.length;
            
            return 0;
        });
        
        return count;
    }

    async getCartItemTitles(): Promise<string[]> {
        const titles: string[] = [];
        const items = await this.cartItemTitle.all();
        for (const item of items) {
            const text = await item.textContent();
            if (text) titles.push(text.trim());
        }
        return titles;
    }

    async getCartTotal(): Promise<string> {
        return await this.cartTotal.textContent() || '';
    }

    async removeItemByIndex(index: number) {
        const deleteButtons = this.page.locator('[aria-label*="Delete"]');
        await deleteButtons.nth(index).click();
    }

    async removeItemByName(itemName: string) {
        await this.page.locator(`text=${itemName}`).locator('..').locator('[aria-label*="Delete"]').click();
    }

    async updateQuantity(index: number, newQuantity: number) {
        const quantityInputs = this.page.locator('input[aria-label*="Quantity"]');
        await quantityInputs.nth(index).clear();
        await quantityInputs.nth(index).fill(newQuantity.toString());
        await this.updateButton.click();
    }

    async proceedToCheckout() {
        await this.proceedToCheckoutButton.click();
        await this.page.waitForURL(/.*\/gp\/checkout.*/);
    }

    async isCartEmpty(): Promise<boolean> {
        return await this.emptyCartMessage.isVisible();
    }

    async verifyItemInCart(itemName: string): Promise<boolean> {
        return await this.page.locator(`text=${itemName}`).isVisible();
    }

    async getCartSubtotal(): Promise<string> {
        return await this.cartSubtotal.first().textContent() || '';
    }

    async clearCart() {
        const itemCount = await this.getCartItemCount();
        for (let i = 0; i < itemCount; i++) {
            await this.removeItemByIndex(0);
            await this.page.waitForTimeout(500); // Wait between deletions
        }
    }

    async saveItemForLater(index: number) {
        const saveButtons = this.page.locator('[aria-label*="Save for later"]');
        await saveButtons.nth(index).click();
    }

    async waitForCartToLoad() {
        await this.page.waitForSelector('[data-item-index]', { timeout: 5000 }).catch(() => {
            // Cart might be empty, which is fine
        });
    }
}
