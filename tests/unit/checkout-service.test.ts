
import { describe, expect, it } from "vitest";

import { ShoppingCart } from "../../src/domain/shopping-cart.js";
import { PromotionEngine } from "../../src/domain/promotion-engine.js";
import { CheckoutService } from "../../src/domain/checkout-service.js";
import type { Product } from "../../src/domain/types.js";

const products: Product[] = [
  { id: 1411, name: "Jockey Wheels - Orange", priceCents: 1539 },
  { id: 23881, name: "Chain Ring 146mm", priceCents: 6595 },
  { id: 13008, name: "Carbon Brake Pads", priceCents: 9200 },
  { id: 9101, name: "Front Derailleur - 34.9mm", priceCents: 3122 },
];

const catalog = {
  getById(productId: number): Product | undefined {
    return products.find((product) => product.id === productId);
  },
};

const checkout = new CheckoutService(
  catalog,
  new PromotionEngine(),
);

describe("CheckoutService", () => {
  it("returns zero totals for an empty cart", () => {
    const cart = new ShoppingCart();

    expect(checkout.calculate(cart)).toEqual({
      lines: [],
      subtotalCents: 0,
      discountPercent: 0,
      discountCents: 0,
      totalCents: 0,
    });
  });

  it("calculates a single product without a discount", () => {
    const cart = new ShoppingCart();
    cart.add(1411);

    const summary = checkout.calculate(cart);

    expect(summary.subtotalCents).toBe(1539);
    expect(summary.discountPercent).toBe(0);
    expect(summary.totalCents).toBe(1539);
  });

  it("calculates multiple quantities correctly", () => {
    const cart = new ShoppingCart();
    cart.add(1411, 3);

    const summary = checkout.calculate(cart);

    expect(summary.lines[0]?.quantity).toBe(3);
    expect(summary.lines[0]?.lineTotalCents).toBe(4617);
    expect(summary.discountPercent).toBe(10);
    expect(summary.totalCents).toBe(4155);
  });

  it("calculates the supplied Marketplacer example", () => {
    const cart = new ShoppingCart();

    cart.add(1411);
    cart.add(23881);
    cart.add(13008);
    cart.add(9101);

    const summary = checkout.calculate(cart);

    expect(summary.subtotalCents).toBe(20456);
    expect(summary.discountPercent).toBe(20);
    expect(summary.discountCents).toBe(4091);
    expect(summary.totalCents).toBe(16365);
  });

  it("rejects unknown products", () => {
    const cart = new ShoppingCart();
    cart.add(9999);

    expect(() => checkout.calculate(cart)).toThrow(
      "Unknown product: 9999",
    );
  });

  it("does not mutate the shopping cart", () => {
    const cart = new ShoppingCart();
    cart.add(1411, 2);

    const before = cart.getItems();

    checkout.calculate(cart);

    expect(cart.getItems()).toEqual(before);
  });

  it("rejects line total overflow", () => {
    const cart = new ShoppingCart();
    cart.add(13008, Number.MAX_SAFE_INTEGER);

    expect(() => checkout.calculate(cart)).toThrow(
      "Line total exceeds safe integer range",
    );
  });

  it("rejects subtotal overflow", () => {
    const expensiveCatalog = {
      getById(productId: number): Product | undefined {
        if (productId === 1 || productId === 2) {
          return {
            id: productId,
            name: `Product ${productId}`,
            priceCents: Number.MAX_SAFE_INTEGER,
          };
        }
        return undefined;
      },
    };

    const service = new CheckoutService(
      expensiveCatalog,
      new PromotionEngine(),
    );

    const cart = new ShoppingCart();
    cart.add(1);
    cart.add(2);

    expect(() => service.calculate(cart)).toThrow(
      "Subtotal exceeds safe integer range",
    );
  });
});
