import { Product, InsertProduct, type ProductIngredient, type UserSentiment } from "@shared/schema";

export interface IStorage {
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private currentId: number;

  constructor() {
    this.products = new Map();
    this.currentId = 1;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = {
      id,
      name: insertProduct.name,
      brand: insertProduct.brand,
      category: insertProduct.category,
      ingredients: insertProduct.ingredients as ProductIngredient[],
      usageInstructions: insertProduct.usageInstructions,
      warnings: insertProduct.warnings,
      expiryDate: insertProduct.expiryDate ?? null,
      timeLeft: insertProduct.timeLeft ?? null,
      recommendedFor: insertProduct.recommendedFor,
      notRecommendedFor: insertProduct.notRecommendedFor,
      userSentiment: insertProduct.userSentiment as UserSentiment,
      imageUrl: insertProduct.imageUrl ?? null,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();
