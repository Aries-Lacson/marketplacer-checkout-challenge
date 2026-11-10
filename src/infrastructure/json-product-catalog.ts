
import { readFileSync } from "node:fs";
import { parsePriceToCents } from "../domain/money.js";
import type { Product } from "../domain/types.js";

export class JsonProductCatalog {
  private readonly products = new Map<number, Product>();

  constructor(data: unknown) {
    if (!Array.isArray(data)) {
      throw new Error("Product catalog must be an array");
    }

    for (const item of data) {
      if (typeof item !== "object" || item === null) {
        throw new Error("Invalid product record");
      }

      const record = item as Record<string, unknown>;
      const { uuid, name, price } = record;

      if (!Number.isSafeInteger(uuid) || Number(uuid) <= 0) {
        throw new Error("Product uuid must be a positive integer");
      }

      if (typeof name !== "string" || name.trim() === "") {
        throw new Error(`Invalid product name for ${uuid}`);
      }

      if (typeof price !== "string") {
        throw new Error(`Invalid product price for ${uuid}`);
      }

      const id = Number(uuid);

      if (this.products.has(id)) {
        throw new Error(`Duplicate product uuid: ${id}`);
      }

      this.products.set(
        id,
        Object.freeze({
          id,
          name,
          priceCents: parsePriceToCents(price),
        }),
      );
    }
  }

  static fromFile(filePath: string): JsonProductCatalog {
    const content = readFileSync(filePath, "utf8");
    const data: unknown = JSON.parse(content);
    return new JsonProductCatalog(data);
  }

  getAll(): readonly Product[] {
    return [...this.products.values()];
  }

  getById(productId: number): Product | undefined {
    return this.products.get(productId);
  }
}
