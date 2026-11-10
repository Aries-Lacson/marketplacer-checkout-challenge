
export interface DiscountTier {
  readonly thresholdCents: number;
  readonly percentage: number;
}

export interface DiscountResult {
  readonly percentage: number;
  readonly amountCents: number;
}

const DEFAULT_TIERS: readonly DiscountTier[] = [
  { thresholdCents: 2000, percentage: 10 },
  { thresholdCents: 5000, percentage: 15 },
  { thresholdCents: 10000, percentage: 20 },
];

export class PromotionEngine {
  private readonly tiers: readonly DiscountTier[];

  constructor(tiers: readonly DiscountTier[] = DEFAULT_TIERS) {
    const thresholds = new Set<number>();

    this.tiers = tiers.map((tier) => {
      if (
        !Number.isSafeInteger(tier.thresholdCents) ||
        tier.thresholdCents < 0
      ) {
        throw new Error("Discount threshold must be a non-negative safe integer");
      }

      if (
        !Number.isInteger(tier.percentage) ||
        tier.percentage < 0 ||
        tier.percentage > 100
      ) {
        throw new Error("Discount percentage must be between 0 and 100");
      }

      if (thresholds.has(tier.thresholdCents)) {
        throw new Error("Duplicate discount threshold");
      }

      thresholds.add(tier.thresholdCents);

      return Object.freeze({ ...tier });
    });
  }

  calculate(subtotalCents: number): DiscountResult {
    if (
      !Number.isSafeInteger(subtotalCents) ||
      subtotalCents < 0
    ) {
      throw new Error("Subtotal must be a non-negative safe integer");
    }

    let percentage = 0;

    for (const tier of this.tiers) {
      if (subtotalCents > tier.thresholdCents) {
        percentage = Math.max(percentage, tier.percentage);
      }
    }

    // BigInt avoids precision loss during multiplication.
    // Adding 50 implements half-up rounding for integer percentages.
    const amountCents = Number(
      (BigInt(subtotalCents) * BigInt(percentage) + 50n) / 100n,
    );

    return Object.freeze({
      percentage,
      amountCents,
    });
  }
}
