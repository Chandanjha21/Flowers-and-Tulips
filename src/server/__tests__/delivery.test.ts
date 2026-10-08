import { describe, expect, it } from "vitest";
import { checkDeliveryDate, zonedNow } from "@/server/services/delivery";

const rules = { timeZone: "America/Los_Angeles", sameDayCutoffHour: 14, maxDaysAhead: 90 };
// 2026-10-08 10:00 in Los Angeles (PDT, UTC-7)
const morning = new Date("2026-10-08T17:00:00Z");
// 2026-10-08 15:00 in Los Angeles
const afternoon = new Date("2026-10-08T22:00:00Z");

describe("delivery date rules", () => {
  it("uses the studio time zone, not UTC", () => {
    // 2026-10-09 02:00 UTC is still the 8th in Los Angeles
    expect(zonedNow(new Date("2026-10-09T02:00:00Z"), rules.timeZone).date).toBe("2026-10-08");
  });

  it("allows same day before cutoff and blocks it after", () => {
    expect(checkDeliveryDate("2026-10-08", morning, rules).ok).toBe(true);
    expect(checkDeliveryDate("2026-10-08", afternoon, rules).ok).toBe(false);
    expect(checkDeliveryDate("2026-10-09", afternoon, rules).ok).toBe(true);
  });

  it("blocks past, malformed, impossible and too-far dates", () => {
    expect(checkDeliveryDate("2026-10-07", morning, rules).ok).toBe(false);
    expect(checkDeliveryDate("10/09/2026", morning, rules).ok).toBe(false);
    expect(checkDeliveryDate("2026-02-31", morning, rules).ok).toBe(false);
    expect(checkDeliveryDate("2027-01-06", morning, rules).ok).toBe(true); // 90 days
    expect(checkDeliveryDate("2027-01-07", morning, rules).ok).toBe(false); // 91 days
  });
});
