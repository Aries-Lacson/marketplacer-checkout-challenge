
import { ShoppingCart } from "../domain/shopping-cart.js";
import { PromotionEngine } from "../domain/promotion-engine.js";
import { CheckoutService } from "../domain/checkout-service.js";
import { formatMoney } from "../domain/money.js";
import type { ProductCatalog } from "../domain/checkout-service.js";
import type { Product } from "../domain/types.js";

interface Catalog extends ProductCatalog {
  getAll(): readonly Product[];
}

function parsePositiveInteger(value: string): number | null {
  const trimmed = value.trim();

  if (!/^[1-9]\d*$/.test(trimmed)) {
    return null;
  }

  const number = Number(trimmed);

  return Number.isSafeInteger(number) ? number : null;
}

export async function runCli(
  catalog: Catalog,
  input: AsyncIterable<string>,
  write: (text: string) => void,
): Promise<void> {
  const cart = new ShoppingCart();
  const checkout = new CheckoutService(
    catalog,
    new PromotionEngine(),
  );

  const iterator = input[Symbol.asyncIterator]();

  async function ask(question: string): Promise<string | null> {
    write(question);

    const result = await iterator.next();
    return result.done ? null : result.value.trim();
  }

  function showProducts(): void {
    write("\nAVAILABLE PRODUCTS\n");
    write("------------------------------\n");

    const products = catalog.getAll();

    if (products.length === 0) {
      write("No products available.\n");
      return;
    }

    for (const product of products) {
      write(
        `${product.id} | ${product.name} | ` +
        `${formatMoney(product.priceCents)}\n`,
      );
    }
  }

  function showCart(heading = "SHOPPING CART"): void {
    const summary = checkout.calculate(cart);

    write(`\n${heading}\n`);
    write("------------------------------\n");

    if (summary.lines.length === 0) {
      write("Your cart is empty.\n");
      return;
    }

    for (const line of summary.lines) {
      write(
        `${line.product.name} x ${line.quantity}\n` +
        `  ${formatMoney(line.product.priceCents)} each` +
        ` = ${formatMoney(line.lineTotalCents)}\n`,
      );
    }

    write("------------------------------\n");
    write(`Subtotal: ${formatMoney(summary.subtotalCents)}\n`);
    write(
      `Discount (${summary.discountPercent}%): ` +
      `-${formatMoney(summary.discountCents)}\n`,
    );
    write(`TOTAL: ${formatMoney(summary.totalCents)}\n`);
  }

  write("Welcome to Marketplacer Checkout!\n");

  mainLoop: while (true) {
    write(
      "\nMARKETPLACER CHECKOUT\n" +
      "------------------------------\n" +
      "1. List products\n" +
      "2. Add product to cart\n" +
      "3. View cart\n" +
      "4. Update quantity\n" +
      "5. Remove product\n" +
      "6. Checkout\n" +
      "7. Exit\n",
    );

    const choice = await ask("\nChoose an option: ");

    if (choice === null || choice === "7") {
      break;
    }

    switch (choice) {
      case "1":
        showProducts();
        break;

      case "2": {
        const idInput = await ask("Product ID: ");
        if (idInput === null) break mainLoop;

        const productId = parsePositiveInteger(idInput);

        if (productId === null || !catalog.getById(productId)) {
          write("Invalid or unknown product ID.\n");
          break;
        }

        const quantityInput = await ask("Quantity: ");
        if (quantityInput === null) break mainLoop;

        const quantity = parsePositiveInteger(quantityInput);

        if (quantity === null) {
          write("Quantity must be a positive integer.\n");
          break;
        }

        try {
          cart.add(productId, quantity);
          write("Product added to cart.\n");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unexpected error";

            write(`Unable to add product: ${message}\n`);
        }

        break;
      }

      case "3":
        showCart();
        break;

      case "4": {
        const idInput = await ask("Product ID: ");
        if (idInput === null) break mainLoop;

        const quantityInput = await ask("New quantity: ");
        if (quantityInput === null) break mainLoop;

        const productId = parsePositiveInteger(idInput);
        const quantity = parsePositiveInteger(quantityInput);

        if (productId === null || quantity === null) {
          write("Invalid product ID or quantity.\n");
          break;
        }

        try {
          cart.setQuantity(productId, quantity);
          write("Quantity updated.\n");
        } catch {
          write("Product is not in the cart.\n");
        }

        break;
      }

      case "5": {
        const idInput = await ask("Product ID to remove: ");
        if (idInput === null) break mainLoop;

        const productId = parsePositiveInteger(idInput);

        if (productId === null) {
          write("Invalid product ID.\n");
          break;
        }

        cart.remove(productId);
        write("Removal completed.\n");
        break;
      }

      case "6":
        showCart("CHECKOUT SUMMARY");
        break;

      default:
        write("Invalid option. Please choose 1-7.\n");
    }
  }

  write("\nGoodbye!\n");
}
