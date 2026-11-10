
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { JsonProductCatalog } from "../../src/infrastructure/json-product-catalog.js";

const validProducts = [
  { uuid: 1411, name: "Jockey Wheels - Orange", price: "15.39" },
  { uuid: 23881, name: "Chain Ring 146mm", price: "65.95" },
];

describe("JsonProductCatalog", () => {
  it("loads and converts valid products", () => {
    const catalog = new JsonProductCatalog(validProducts);

    expect(catalog.getAll()).toHaveLength(2);
    expect(catalog.getById(1411)).toEqual({
      id: 1411,
      name: "Jockey Wheels - Orange",
      priceCents: 1539,
    });
  });

  it("returns undefined for unknown products", () => {
    const catalog = new JsonProductCatalog(validProducts);

    expect(catalog.getById(9999)).toBeUndefined();
  });

  it("rejects duplicate product identifiers", () => {
    expect(
      () => new JsonProductCatalog([validProducts[0], validProducts[0]]),
    ).toThrow("Duplicate product uuid");
  });

  it("rejects a non-array catalog", () => {
    expect(() => new JsonProductCatalog({})).toThrow(
      "Product catalog must be an array",
    );
  });

  it.each([
    { uuid: 0, name: "Item", price: "10.00" },
    { uuid: -1, name: "Item", price: "10.00" },
    { uuid: 1.5, name: "Item", price: "10.00" },
    { uuid: "1411", name: "Item", price: "10.00" },
    { uuid: 1, name: "", price: "10.00" },
    { uuid: 1, name: "Item", price: -10 },
    { uuid: 1, name: "Item", price: "10.999" },
    null,
  ])("rejects invalid product records: %j", (product) => {
    expect(() => new JsonProductCatalog([product])).toThrow();
  });

  it("does not expose mutable product objects", () => {
    const catalog = new JsonProductCatalog(validProducts);
    const product = catalog.getById(1411);

    expect(product).toBeDefined();
    expect(Object.isFrozen(product)).toBe(true);
  });

  it("loads the original Marketplacer product fixture", () => {
    const filePath = resolve("data/products.json");
    const catalog = JsonProductCatalog.fromFile(filePath);

    expect(catalog.getAll()).toHaveLength(4);
    expect(catalog.getById(13008)?.priceCents).toBe(9200);
    expect(catalog.getById(9101)?.priceCents).toBe(3122);
  });
});
