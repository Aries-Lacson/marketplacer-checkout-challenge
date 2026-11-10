
import { describe, expect, it } from "vitest";
import { runCli } from "../../src/cli/menu.js";
import { JsonProductCatalog } from "../../src/infrastructure/json-product-catalog.js";
import { resolve } from "node:path";

const catalog = JsonProductCatalog.fromFile(
  resolve("data/products.json"),
);

async function executeCli(commands: string[]): Promise<string> {
  async function* input(): AsyncGenerator<string> {
    for (const command of commands) {
      yield command;
    }
  }

  let output = "";

  await runCli(catalog, input(), (text) => {
    output += text;
  });

  return output;
}

describe("Checkout CLI", () => {
  it("lists all available products", async () => {
    const output = await executeCli(["1", "7"]);

    expect(output).toContain("AVAILABLE PRODUCTS");
    expect(output).toContain("Jockey Wheels - Orange");
    expect(output).toContain("Carbon Brake Pads");
    expect(output).toContain("$92.00");
  });

  it("completes the original checkout example", async () => {
    const output = await executeCli([
      "2", "1411", "1",
      "2", "23881", "1",
      "2", "13008", "1",
      "2", "9101", "1",
      "6",
      "7",
    ]);

    expect(output).toContain("CHECKOUT SUMMARY");
    expect(output).toContain("Subtotal: $204.56");
    expect(output).toContain("Discount (20%): -$40.91");
    expect(output).toContain("TOTAL: $163.65");
  });

  it("updates product quantities", async () => {
    const output = await executeCli([
      "2", "1411", "1",
      "4", "1411", "3",
      "6",
      "7",
    ]);

    expect(output).toContain("Quantity updated.");
    expect(output).toContain("TOTAL: $41.55");
  });

  it("removes products from the cart", async () => {
    const output = await executeCli([
      "2", "1411", "1",
      "5", "1411",
      "3",
      "7",
    ]);

    expect(output).toContain("Removal completed.");
    expect(output).toContain("Your cart is empty.");
  });

  it("handles unknown product IDs", async () => {
    const output = await executeCli([
      "2", "9999",
      "7",
    ]);

    expect(output).toContain("Invalid or unknown product ID.");
  });

  it("rejects invalid quantities", async () => {
    const output = await executeCli([
      "2", "1411", "-2",
      "7",
    ]);

    expect(output).toContain(
      "Quantity must be a positive integer.",
    );
  });

  it("recovers from invalid menu choices", async () => {
    const output = await executeCli([
      "99",
      "1",
      "7",
    ]);

    expect(output).toContain(
      "Invalid option. Please choose 1-7.",
    );

    expect(output).toContain("AVAILABLE PRODUCTS");
  });

  it("exits cleanly when input ends", async () => {
    const output = await executeCli([]);

    expect(output).toContain("Goodbye!");
  });

  it("exits when the user selects option 7", async () => {
    const output = await executeCli(["7"]);

    expect(output).toContain("Goodbye!");
  });

  it("does not display duplicate checkout headings", async () => {
    const output = await executeCli(["6", "7"]);

    expect(output).toContain("CHECKOUT SUMMARY");
    expect(output).not.toContain("SHOPPING CART");
  });
});
