
/**
 * Converts a non-negative decimal price into integer cents.
 *
 * Examples:
 * "15.39" -> 1539
 * "92.00" -> 9200
 * "1.5"   -> 150
 */
export function parsePriceToCents(price: string): number {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(price);

  if (!match) {
    throw new Error(`Invalid price: "${price}"`);
  }

  const dollars = BigInt(match[1]!);
  const fractionalPart = (match[2] ?? "").padEnd(2, "0");

  const cents = dollars * 100n + BigInt(fractionalPart);

  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`Price exceeds safe integer range: "${price}"`);
  }

  return Number(cents);
}

/**
 * Formats integer cents as a dollar amount.
 */
export function formatMoney(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new Error("Amount must be a non-negative safe integer");
  }

  const dollars = Math.floor(cents / 100);
  const remainder = cents % 100;

  return `$${dollars}.${String(remainder).padStart(2, "0")}`;
}
