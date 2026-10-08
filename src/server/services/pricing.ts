import { site } from "@/config/site";

/*
 * Pure money math, in integer cents. The only place totals are computed;
 * client-supplied prices are never read.
 */

export const MAX_LINE_QUANTITY = 20;
export const MAX_CART_LINES = 30;

export const toCents = (dollars: number) => Math.round(dollars * 100);
export const toDollars = (cents: number) => cents / 100;

export const FREE_DELIVERY_OVER_CENTS = toCents(site.freeDeliveryOver);
export const DELIVERY_FEE_CENTS = toCents(site.deliveryFee);

export interface PriceableLine {
  unitPriceCents: number;
  /** Prices of the add-ons on one unit. */
  addOnPricesCents: number[];
  quantity: number;
}

export function lineTotalCents(line: PriceableLine): number {
  if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_LINE_QUANTITY) {
    throw new RangeError(`quantity must be 1–${MAX_LINE_QUANTITY}`);
  }
  const prices = [line.unitPriceCents, ...line.addOnPricesCents];
  if (prices.some((p) => !Number.isInteger(p) || p < 0)) throw new RangeError("prices must be non-negative integer cents");
  const perUnit = prices.reduce((a, b) => a + b, 0);
  return perUnit * line.quantity;
}

export function deliveryFeeCents(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_DELIVERY_OVER_CENTS ? 0 : DELIVERY_FEE_CENTS;
}

export interface Totals {
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export function computeTotals(lines: PriceableLine[]): Totals {
  if (lines.length > MAX_CART_LINES) throw new RangeError(`at most ${MAX_CART_LINES} lines`);
  const subtotalCents = lines.reduce((sum, l) => sum + lineTotalCents(l), 0);
  const fee = deliveryFeeCents(subtotalCents);
  return { subtotalCents, deliveryFeeCents: fee, totalCents: subtotalCents + fee };
}
