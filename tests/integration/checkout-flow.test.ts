
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { ShoppingCart } from "../../src/domain/shopping-cart.js";
import { PromotionEngine } from "../../src/domain/promotion-engine.js";
import { CheckoutService } from "../../src/domain/checkout-service.js";
import { JsonProductCatalog } from "../../src/infrastructure/json-product-catalog.js";

function createApplication() {
  const catalog = JsonProductCatalog.fromFile(
    resolve("data/products.json"),
  );

  const cart = new ShoppingCart();

  const checkout = new CheckoutService(
    catalog,
    new PromotionEngine(),
  );

  return { catalog, cart, checkout };
}

describe("Checkout integration", () => {
  it("calculates the original Marketplacer checkout example", () => {
    const { catalog, cart, checkout } = createApplication();

    for (const product of catalog.getAll()) {
      cart.add(product.id);
    }

    const summary = checkout.calculate(cart);

    expect(summary.lines).toHaveLength(4);
    expect(summary.subtotalCents).toBe(20456);
    expect(summary.discountPercent).toBe(20);
    expect(summary.discountCents).toBe(4091);
    expect(summary.totalCents).toBe(16365);
  });

  it("recalculates checkout after cart changes", () => {
    const { cart, checkout } = createApplication();

    cart.add(1411);

    expect(checkout.calculate(cart).totalCents).toBe(1539);

    cart.add(1411);

    const updated = checkout.calculate(cart);

    expect(updated.subtotalCents).toBe(3078);
    expect(updated.discountPercent).toBe(10);
    expect(updated.totalCents).toBe(2770);

    cart.remove(1411);

    expect(checkout.calculate(cart).totalCents).toBe(0);
  });

  it("resolves product information from the real catalog", () => {
    const { cart, checkout } = createApplication();

    cart.add(23881, 2);

    const summary = checkout.calculate(cart);

    expect(summary.lines).toEqual([
      {
        product: {
          id: 23881,
          name: "Chain Ring 146mm",
          priceCents: 6595,
        },
        quantity: 2,
        lineTotalCents: 13190,
      },
    ]);

    expect(summary.discountPercent).toBe(20);
    expect(summary.discountCents).toBe(2638);
    expect(summary.totalCents).toBe(10552);
  });
});
