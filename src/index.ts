
import { createInterface } from "node:readline";
import { resolve } from "node:path";

import { JsonProductCatalog } from "./infrastructure/json-product-catalog.js";
import { runCli } from "./cli/menu.js";

async function main(): Promise<void> {
  const catalogPath = resolve("data/products.json");
  const catalog = JsonProductCatalog.fromFile(catalogPath);

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: Boolean(process.stdin.isTTY),
  });

  try {
    await runCli(
      catalog,
      readline,
      (text) => process.stdout.write(text),
    );
  } finally {
    readline.close();
  }
}

main().catch((error: unknown) => {
  console.error("Application error:", error);
  process.exitCode = 1;
});
