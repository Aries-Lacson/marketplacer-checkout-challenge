
import type { CartItem } from "./types.js";

export class ShoppingCart {
  private readonly items = new Map<number, number>();

  add(productId: number, quantity = 1): void {
    this.validateProductId(productId);
    this.validateQuantity(quantity);

    const currentQuantity = this.items.get(productId) ?? 0;
    const newQuantity = currentQuantity + quantity;

    this.validateQuantity(newQuantity);

    this.items.set(productId, newQuantity);
  }

  setQuantity(productId: number, quantity: number): void {
    this.validateProductId(productId);
    this.validateQuantity(quantity);

    if (!this.items.has(productId)) {
      throw new Error(`Product ${productId} is not in the cart`);
    }

    this.items.set(productId, quantity);
  }

  remove(productId: number): void {
    this.validateProductId(productId);
    this.items.delete(productId);
  }

  getItems(): readonly CartItem[] {
    return Array.from(
      this.items,
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );
  }

  clear(): void {
    this.items.clear();
  }

  private validateProductId(productId: number): void {
    if (!Number.isSafeInteger(productId) || productId <= 0) {
      throw new Error("Product ID must be a positive safe integer");
    }
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive safe integer");
    }
  }
}
