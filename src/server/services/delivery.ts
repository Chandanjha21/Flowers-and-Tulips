import { site } from "@/config/site";

/*
 * Delivery date rules, evaluated in the studio's time zone (not the server's or the browser's).
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** Calendar date and hour in `timeZone` at instant `now`. */
export function zonedNow(now: Date, timeZone: string = site.timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

const utcDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  // Reject impossible dates like 2026-02-31.
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return NaN;
  return t;
};

export type DeliveryDateCheck = { ok: true } | { ok: false; reason: string };

export function checkDeliveryDate(
  date: string,
  now: Date = new Date(),
  rules: { timeZone: string; sameDayCutoffHour: number; maxDaysAhead: number } = site,
): DeliveryDateCheck {
  if (!ISO_DATE.test(date)) return { ok: false, reason: "Delivery date must be YYYY-MM-DD" };
  const target = utcDay(date);
  if (Number.isNaN(target)) return { ok: false, reason: "Delivery date is not a real date" };

  const local = zonedNow(now, rules.timeZone);
  const diffDays = Math.round((target - utcDay(local.date)) / DAY_MS);

  if (diffDays < 0) return { ok: false, reason: "Delivery date is in the past" };
  if (diffDays === 0 && local.hour >= rules.sameDayCutoffHour) {
    return { ok: false, reason: "Same-day delivery has closed for today. Please choose another date." };
  }
  if (diffDays > rules.maxDaysAhead) return { ok: false, reason: `Orders can be scheduled up to ${rules.maxDaysAhead} days ahead` };
  return { ok: true };
}
