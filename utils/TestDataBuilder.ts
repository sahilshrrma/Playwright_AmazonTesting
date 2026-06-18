/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

interface Product {
    id: number;
    name: string;
    category: string;
    priceRange: {
        min: number;
        max: number;
    };
    minRating: number;
    keywords: string[];
}

interface TestUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export class TestDataBuilder {
    private static data: any;

    static loadTestData() {
        if (!this.data) {
            try {
                const testDataPath = path.join(process.cwd(), 'test-data', 'products.json');
                const rawData = fs.readFileSync(testDataPath, 'utf-8');
                this.data = JSON.parse(rawData);
            } catch (error) {
                console.error('Failed to load test data:', error);
                throw new Error('Could not load test data from test-data/products.json');
            }
        }
        return this.data;
    }

    static getProductByName(productName: string): Product | undefined {
        const data = this.loadTestData();
        return data.products.find((p: Product) => p.name.toLowerCase() === productName.toLowerCase());
    }

    static getAllProducts(): Product[] {
        const data = this.loadTestData();
        return data.products;
    }

    static getProductsByCategory(category: string): Product[] {
        const data = this.loadTestData();
        return data.products.filter((p: Product) => p.category === category);
    }

    static getProductsByPriceRange(minPrice: number, maxPrice: number): Product[] {
        const data = this.loadTestData();
        return data.products.filter(
            (p: Product) => p.priceRange.min >= minPrice && p.priceRange.max <= maxPrice
        );
    }

    static getTestUser(index: number = 0): TestUser | undefined {
        const data = this.loadTestData();
        return data.testUsers[index];
    }

    static getAllTestUsers(): TestUser[] {
        const data = this.loadTestData();
        return data.testUsers;
    }

    static getRandomProduct(): Product {
        const data = this.loadTestData();
        const products = data.products;
        return products[Math.floor(Math.random() * products.length)];
    }
}
