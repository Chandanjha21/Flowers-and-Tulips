import { describe, expect, it } from "vitest";
import { canAdminTransition } from "@/server/services/order-status";

describe("admin order transitions", () => {
  it("follows the fulfilment flow", () => {
    expect(canAdminTransition("paid", "in_design")).toBe(true);
    expect(canAdminTransition("in_design", "out_for_delivery")).toBe(true);
    expect(canAdminTransition("out_for_delivery", "delivered")).toBe(true);
  });

  it("never lets staff mark an order paid or refunded by hand", () => {
    expect(canAdminTransition("pending_payment", "paid")).toBe(false);
    expect(canAdminTransition("paid", "refunded")).toBe(false);
    expect(canAdminTransition("delivered", "in_design")).toBe(false);
    expect(canAdminTransition("cancelled", "paid")).toBe(false);
  });
});
