
import { describe, expect, it } from "vitest";
import { ShoppingCart } from "../../src/domain/shopping-cart.js";

describe("ShoppingCart", () => {
  it("starts empty", () => {
    const cart = new ShoppingCart();

    expect(cart.getItems()).toEqual([]);
  });

  it("adds a product with quantity one by default", () => {
    const cart = new ShoppingCart();

    cart.add(1411);

    expect(cart.getItems()).toEqual([
      { productId: 1411, quantity: 1 },
    ]);
  });

  it("accepts an explicit quantity", () => {
    const cart = new ShoppingCart();

    cart.add(1411, 3);

    expect(cart.getItems()).toEqual([
      { productId: 1411, quantity: 3 },
    ]);
  });

  it("increases quantity when adding an existing product", () => {
    const cart = new ShoppingCart();

    cart.add(1411, 2);
    cart.add(1411, 3);

    expect(cart.getItems()).toEqual([
      { productId: 1411, quantity: 5 },
    ]);
  });

  it("maintains separate quantities for different products", () => {
    const cart = new ShoppingCart();

    cart.add(1411, 2);
    cart.add(23881);

    expect(cart.getItems()).toEqual([
      { productId: 1411, quantity: 2 },
      { productId: 23881, quantity: 1 },
    ]);
  });

  it("updates the quantity of an existing product", () => {
    const cart = new ShoppingCart();

    cart.add(1411);
    cart.setQuantity(1411, 4);

    expect(cart.getItems()[0]?.quantity).toBe(4);
  });

  it("rejects quantity updates for products not in the cart", () => {
    const cart = new ShoppingCart();

    expect(() => cart.setQuantity(1411, 2)).toThrow(
      "Product 1411 is not in the cart",
    );
  });

  it("removes a product", () => {
    const cart = new ShoppingCart();

    cart.add(1411);
    cart.remove(1411);

    expect(cart.getItems()).toEqual([]);
  });

  it("allows removing a product that is already absent", () => {
    const cart = new ShoppingCart();

    expect(() => cart.remove(1411)).not.toThrow();
  });

  it("clears all products", () => {
    const cart = new ShoppingCart();

    cart.add(1411);
    cart.add(23881);

    cart.clear();

    expect(cart.getItems()).toEqual([]);
  });

  it.each([0, -1, 1.5, Number.NaN, Infinity])(
    "rejects invalid product ID %s",
    (productId) => {
      const cart = new ShoppingCart();

      expect(() => cart.add(productId)).toThrow(
        "Product ID must be a positive safe integer",
      );
    },
  );

  it.each([0, -1, 1.5, Number.NaN, Infinity])(
    "rejects invalid quantity %s",
    (quantity) => {
      const cart = new ShoppingCart();

      expect(() => cart.add(1411, quantity)).toThrow(
        "Quantity must be a positive safe integer",
      );
    },
  );

  it("rejects quantity overflow without changing cart state", () => {
    const cart = new ShoppingCart();

    cart.add(1411, Number.MAX_SAFE_INTEGER);

    expect(() => cart.add(1411, 1)).toThrow(
      "Quantity must be a positive safe integer",
    );

    expect(cart.getItems()[0]?.quantity).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });

  it("does not expose its internal state", () => {
  const cart = new ShoppingCart();

  cart.add(1411);

  const snapshot = cart.getItems();

  cart.setQuantity(1411, 5);

  expect(snapshot[0]?.quantity).toBe(1);
  expect(cart.getItems()[0]?.quantity).toBe(5);
  });

});
