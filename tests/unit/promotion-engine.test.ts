
import { describe, expect, it } from "vitest";
import { PromotionEngine } from "../../src/domain/promotion-engine.js";

describe("PromotionEngine", () => {
  const engine = new PromotionEngine();

  describe("discount thresholds", () => {
    it.each([
      [0, 0],
      [2000, 0],
      [2001, 10],
      [5000, 10],
      [5001, 15],
      [10000, 15],
      [10001, 20],
      [20456, 20],
    ])(
      "applies %i percent at subtotal %i cents",
      (subtotalCents, expectedPercentage) => {
        expect(
          engine.calculate(subtotalCents).percentage,
        ).toBe(expectedPercentage);
      },
    );
  });

  describe("discount calculation", () => {
    it("returns zero discount below the first threshold", () => {
      expect(engine.calculate(1500)).toEqual({
        percentage: 0,
        amountCents: 0,
      });
    });

    it("calculates a 10 percent discount", () => {
      expect(engine.calculate(3000)).toEqual({
        percentage: 10,
        amountCents: 300,
      });
    });

    it("calculates a 15 percent discount", () => {
      expect(engine.calculate(6595)).toEqual({
        percentage: 15,
        amountCents: 989,
      });
    });

    it("calculates a 20 percent discount", () => {
      expect(engine.calculate(20456)).toEqual({
        percentage: 20,
        amountCents: 4091,
      });
    });

    it("rounds half cents up", () => {
      expect(engine.calculate(2005).amountCents).toBe(201);
    });

    it("handles large safe integer subtotals", () => {
      const subtotal = Number.MAX_SAFE_INTEGER;
      const result = engine.calculate(subtotal);

      const expected = Number(
        (BigInt(subtotal) * 20n + 50n) / 100n,
      );

      expect(result.amountCents).toBe(expected);
    });
  });

  describe("custom promotion rules", () => {
    it("accepts custom discount tiers", () => {
      const custom = new PromotionEngine([
        { thresholdCents: 1000, percentage: 5 },
      ]);

      expect(custom.calculate(1000).percentage).toBe(0);
      expect(custom.calculate(1001).percentage).toBe(5);
    });

    it("selects the highest eligible discount regardless of order", () => {
      const custom = new PromotionEngine([
        { thresholdCents: 10000, percentage: 20 },
        { thresholdCents: 2000, percentage: 10 },
        { thresholdCents: 5000, percentage: 15 },
      ]);

      expect(custom.calculate(15000).percentage).toBe(20);
    });

    it("allows an empty set of promotions", () => {
      const custom = new PromotionEngine([]);

      expect(custom.calculate(15000)).toEqual({
        percentage: 0,
        amountCents: 0,
      });
    });

    it("rounds custom percentage discounts correctly", () => {
      const custom = new PromotionEngine([
        { thresholdCents: 0, percentage: 25 },
      ]);

      expect(custom.calculate(2).amountCents).toBe(1);
    });

    it("does not allow external mutation of promotion rules", () => {
      const tiers = [
        { thresholdCents: 1000, percentage: 5 },
      ];

      const custom = new PromotionEngine(tiers);

      tiers[0]!.percentage = 99;

      expect(custom.calculate(2000).percentage).toBe(5);
    });
  });

  describe("validation", () => {
    it.each([-1, 1.5, NaN, Infinity])(
      "rejects invalid subtotal %s",
      (subtotal) => {
        expect(() => engine.calculate(subtotal)).toThrow(
          "Subtotal must be a non-negative safe integer",
        );
      },
    );

    it("rejects subtotal overflow", () => {
      expect(() =>
        engine.calculate(Number.MAX_SAFE_INTEGER + 1),
      ).toThrow();
    });

    it("rejects negative discount thresholds", () => {
      expect(() =>
        new PromotionEngine([
          { thresholdCents: -1, percentage: 10 },
        ]),
      ).toThrow();
    });

    it("rejects percentages above 100", () => {
      expect(() =>
        new PromotionEngine([
          { thresholdCents: 1000, percentage: 101 },
        ]),
      ).toThrow();
    });

    it("rejects fractional percentages", () => {
      expect(() =>
        new PromotionEngine([
          { thresholdCents: 1000, percentage: 10.5 },
        ]),
      ).toThrow();
    });

    it("rejects duplicate thresholds", () => {
      expect(() =>
        new PromotionEngine([
          { thresholdCents: 1000, percentage: 10 },
          { thresholdCents: 1000, percentage: 15 },
        ]),
      ).toThrow("Duplicate discount threshold");
    });
  });
});
