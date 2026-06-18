import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
    readonly searchResultsContainer: Locator;
    readonly productTitle: Locator;
    readonly priceFilter: Locator;
    readonly minPriceInput: Locator;
    readonly maxPriceInput: Locator;
    readonly applyPriceButton: Locator;
    readonly ratingFilter: Locator;
    readonly sortDropdown: Locator;
    readonly productItem: Locator;
    readonly productCount: Locator;

    constructor(page: Page) {
        super(page);
        this.searchResultsContainer = page.locator('[data-component-type="s-search-result"]');
        this.productTitle = page.locator('h2 a span');
        this.priceFilter = page.locator('input[aria-label*="price"]');
        this.minPriceInput = page.locator('input[aria-label*="min"]');
        this.maxPriceInput = page.locator('input[aria-label*="max"]');
        this.applyPriceButton = page.locator('input[aria-label*="Go"]');
        this.ratingFilter = page.locator('i.a-icon-star-small span');
        this.sortDropdown = page.locator('select#s-result-sort-select');
        this.productItem = page.locator('[data-component-type="s-search-result"]');
        this.productCount = page.locator('.sg-col-inner');
    }

    async getProductCount(): Promise<number> {
        return await this.productItem.count();
    }

    async getProductTitles(): Promise<string[]> {
        // Add a small delay to ensure all content is rendered
        await this.page.waitForTimeout(1500);
        
        // Use evaluate to extract titles directly from the page with multiple selector strategies
        const titles = await this.page.evaluate(() => {
            const result: string[] = [];
            
            // Strategy 1: Look for all h2 elements that might contain product titles
            const h2s = document.querySelectorAll('h2');
            h2s.forEach(h2 => {
                // Get the first link's span text if it exists
                const span = h2.querySelector('a span');
                if (span) {
                    const text = span.textContent?.trim();
                    if (text && text.length > 0) {
                        result.push(text);
                    }
                }
                // If no span in link, try to get h2's text directly
                else if (result.length === 0) {
                    const text = h2.textContent?.trim();
                    if (text && text.length > 5) { // Avoid short labels
                        result.push(text);
                    }
                }
            });
            
            return result;
        });
        
        return titles;
    }

    async selectProduct(productIndex: number) {
        // Add a delay to ensure products are rendered
        await this.page.waitForTimeout(2000);
        
        // Use evaluate to find and click the product using multiple strategies
        await this.page.evaluate((index: number) => {
            let clickableElements: HTMLElement[] = [];
            
            // Strategy 1: Look for h2 elements with links (traditional product listings)
            const h2Elements = document.querySelectorAll('h2');
            h2Elements.forEach(h2 => {
                const link = h2.querySelector('a');
                if (link && link.href) {
                    clickableElements.push(link);
                }
            });
            
            // Strategy 2: If no h2s with links, look for divs with class containing "s-asin" that have clickable links
            if (clickableElements.length === 0) {
                const asinDivs = document.querySelectorAll('[class*="s-asin"] a');
                asinDivs.forEach(link => {
                    if ((link as HTMLAnchorElement).href && !clickableElements.includes(link as HTMLElement)) {
                        clickableElements.push(link as HTMLElement);
                    }
                });
            }
            
            // Strategy 3: Look for any h2 within [data-component-type="s-search-result"]
            if (clickableElements.length === 0) {
                const searchResults = document.querySelectorAll('[data-component-type="s-search-result"]');
                searchResults.forEach(result => {
                    const h2 = result.querySelector('h2');
                    if (h2) {
                        const link = h2.querySelector('a');
                        if (link && (link as HTMLAnchorElement).href) {
                            clickableElements.push(link as HTMLElement);
                        }
                    }
                });
            }
            
            // Strategy 4: Look for role="heading" within product containers
            if (clickableElements.length === 0) {
                const headings = document.querySelectorAll('[role="heading"]');
                headings.forEach(heading => {
                    const link = heading.querySelector('a');
                    if (link && (link as HTMLAnchorElement).href && link.textContent && link.textContent.trim().length > 5) {
                        clickableElements.push(link as HTMLElement);
                    }
                });
            }
            
            if (clickableElements.length === 0) {
                throw new Error('No clickable product elements found on the page');
            }
            
            if (index >= clickableElements.length) {
                throw new Error(`Product index ${index} out of range. Only ${clickableElements.length} products found.`);
            }
            
            // Click the element
            (clickableElements[index] as HTMLAnchorElement).click();
        }, productIndex);
        
        // Wait for the product detail page to load
        await this.page.waitForTimeout(3000);
    }

    async selectProductByName(productName: string) {
        await this.page.locator(`h2 a:has-text("${productName}")`).click();
    }

    async filterByPriceRange(minPrice: string, maxPrice: string) {
        try {
            // Add a small delay to ensure filter elements are loaded
            await this.page.waitForTimeout(1000);
            
            // Try to find and fill the min price input with multiple selector strategies
            let minInput = this.page.locator('input[aria-label*="min"]');
            
            // Fallback selectors if aria-label doesn't work
            if (!await minInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                // Try id-based selectors
                minInput = this.page.locator('input[id*="min-price"]');
            }
            
            if (!await minInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                // Try placeholder-based selectors
                minInput = this.page.locator('input[placeholder*="min"]');
            }
            
            if (!await minInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                throw new Error('Min price input not found');
            }
            
            await minInput.fill(minPrice);
            
            // Try to find and fill the max price input
            let maxInput = this.page.locator('input[aria-label*="max"]');
            
            if (!await maxInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                maxInput = this.page.locator('input[id*="max-price"]');
            }
            
            if (!await maxInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                maxInput = this.page.locator('input[placeholder*="max"]');
            }
            
            if (!await maxInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                throw new Error('Max price input not found');
            }
            
            await maxInput.fill(maxPrice);
            
            // Try to find and click the apply button
            let applyButton = this.page.locator('input[aria-label*="Go"]');
            
            if (!await applyButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                applyButton = this.page.locator('button:has-text("Go")');
            }
            
            if (!await applyButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                applyButton = this.page.locator('[aria-label*="Apply"]');
            }
            
            if (await applyButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await applyButton.click();
                await this.page.waitForTimeout(1500);
            }
        } catch (error) {
            throw new Error(`Failed to apply price filter: ${error}`);
        }
    }

    async sortByOption(sortOption: string) {
        // Options: 'price-asc-rank', 'price-desc-rank', 'review-rank', 'date-desc-rank'
        await this.sortDropdown.selectOption(sortOption);
    }

    async filterByRating(stars: number) {
        // Filter by star rating (4 stars and up, etc.)
        await this.page.locator(`[aria-label="${stars} Stars & Up"]`).click();
    }

    async verifyProductsDisplayed(): Promise<boolean> {
        return await this.searchResultsContainer.first().isVisible();
    }

    async waitForSearchResults() {
        await this.page.waitForSelector('[data-component-type="s-search-result"]');
    }
}
