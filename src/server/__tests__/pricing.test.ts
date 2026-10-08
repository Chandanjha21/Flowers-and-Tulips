import { describe, expect, it } from "vitest";
import { computeTotals, deliveryFeeCents, DELIVERY_FEE_CENTS, FREE_DELIVERY_OVER_CENTS, lineTotalCents } from "@/server/services/pricing";

describe("pricing", () => {
  it("multiplies unit + add-ons by quantity", () => {
    expect(lineTotalCents({ unitPriceCents: 9500, addOnPricesCents: [2400, 0], quantity: 2 })).toBe(23800);
  });

  it("rejects bad quantities and negative or fractional prices", () => {
    expect(() => lineTotalCents({ unitPriceCents: 100, addOnPricesCents: [], quantity: 0 })).toThrow();
    expect(() => lineTotalCents({ unitPriceCents: 100, addOnPricesCents: [], quantity: 21 })).toThrow();
    expect(() => lineTotalCents({ unitPriceCents: 100, addOnPricesCents: [], quantity: 1.5 })).toThrow();
    expect(() => lineTotalCents({ unitPriceCents: -1, addOnPricesCents: [], quantity: 1 })).toThrow();
    expect(() => lineTotalCents({ unitPriceCents: 100, addOnPricesCents: [9.99], quantity: 1 })).toThrow();
  });

  it("charges delivery below the threshold and waives it at or above", () => {
    expect(deliveryFeeCents(0)).toBe(0);
    expect(deliveryFeeCents(FREE_DELIVERY_OVER_CENTS - 1)).toBe(DELIVERY_FEE_CENTS);
    expect(deliveryFeeCents(FREE_DELIVERY_OVER_CENTS)).toBe(0);
  });

  it("computes totals", () => {
    const t = computeTotals([{ unitPriceCents: 4000, addOnPricesCents: [], quantity: 1 }]);
    expect(t).toEqual({ subtotalCents: 4000, deliveryFeeCents: DELIVERY_FEE_CENTS, totalCents: 4000 + DELIVERY_FEE_CENTS });
  });
});
