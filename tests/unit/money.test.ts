
import { describe, expect, it } from "vitest";
import {
  formatMoney,
  parsePriceToCents,
} from "../../src/domain/money.js";

describe("parsePriceToCents", () => {
  it.each([
    ["15.39", 1539],
    ["92.00", 9200],
    ["0.99", 99],
    ["1.5", 150],
    ["10", 1000],
    ["0", 0],
  ])("converts %s to %i cents", (input, expected) => {
    expect(parsePriceToCents(input)).toBe(expected);
  });

  it.each([
    "-10.00",
    "15.399",
    "12abc",
    "",
    " ",
    "1,000.00",
    "01.50",
    "Infinity",
    "NaN",
  ])("rejects invalid price %s", (input) => {
    expect(() => parsePriceToCents(input)).toThrow(
      "Invalid price",
    );
  });

  it("rejects prices outside the safe integer range", () => {
    expect(() =>
      parsePriceToCents("90071992547409.92"),
    ).toThrow("safe integer range");
  });
});

describe("formatMoney", () => {
  it.each([
    [0, "$0.00"],
    [99, "$0.99"],
    [1539, "$15.39"],
    [9200, "$92.00"],
    [20456, "$204.56"],
  ])("formats %i cents as %s", (input, expected) => {
    expect(formatMoney(input)).toBe(expected);
  });

  it("rejects invalid monetary amounts", () => {
    expect(() => formatMoney(-100)).toThrow();
    expect(() => formatMoney(1.5)).toThrow();
    expect(() => formatMoney(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });
});
