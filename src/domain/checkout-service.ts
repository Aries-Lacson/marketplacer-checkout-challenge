
import type {
  Product,
  CheckoutLine,
  CheckoutSummary,
} from "./types.js";

import { ShoppingCart } from "./shopping-cart.js";
import { PromotionEngine } from "./promotion-engine.js";

export interface ProductCatalog {
  getById(productId: number): Product | undefined;
}

export class CheckoutService {
  constructor(
    private readonly catalog: ProductCatalog,
    private readonly promotions: PromotionEngine,
  ) {}

  calculate(cart: ShoppingCart): CheckoutSummary {
    const lines: CheckoutLine[] = [];
    let subtotalCents = 0;

    for (const item of cart.getItems()) {
      const product = this.catalog.getById(item.productId);

      if (!product) {
        throw new Error(`Unknown product: ${item.productId}`);
      }

      const lineTotalCents =
        product.priceCents * item.quantity;

      if (!Number.isSafeInteger(lineTotalCents)) {
        throw new Error("Line total exceeds safe integer range");
      }

      subtotalCents += lineTotalCents;

      if (!Number.isSafeInteger(subtotalCents)) {
        throw new Error("Subtotal exceeds safe integer range");
      }

      lines.push({
        product,
        quantity: item.quantity,
        lineTotalCents,
      });
    }

    const discount = this.promotions.calculate(subtotalCents);

    return {
      lines,
      subtotalCents,
      discountPercent: discount.percentage,
      discountCents: discount.amountCents,
      totalCents: subtotalCents - discount.amountCents,
    };
  }
}
