import "server-only";
import { and, count, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { site } from "@/config/site";
import { db } from "@/server/db/client";
import { orderItems, orders } from "@/server/db/schema";
import { unprocessable } from "@/server/http/errors";
import { zonedNow } from "./delivery";
import { PAID_STATUSES } from "./order-status";

const DAY_MS = 86_400_000;
const shift = (iso: string, days: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

/** Dashboard numbers. Dates are calendar days in the studio's time zone, inclusive. */
export async function getStats(range: { from?: string; to?: string }) {
  const today = zonedNow(new Date()).date;
  const to = range.to ?? today;
  const from = range.from ?? shift(to, -29);
  if (from > to) throw unprocessable("`from` must be on or before `to`");
  if (Date.parse(to) - Date.parse(from) > 366 * DAY_MS) throw unprocessable("Range can be at most one year");

  const tz = site.timeZone;
  // Inlined (not a bind parameter) so SELECT and GROUP BY are the identical expression. Config constant, validated.
  if (!/^[A-Za-z_]+(\/[A-Za-z_+-]+)*$/.test(tz)) throw new Error("Invalid site.timeZone");
  const tzLit = sql.raw(`'${tz}'`);
  const paidDay = sql`(${orders.paidAt} AT TIME ZONE ${tzLit})::date`;
  const createdDay = sql`(${orders.createdAt} AT TIME ZONE ${tzLit})::date`;
  const paidInRange = and(isNotNull(orders.paidAt), sql`${paidDay} BETWEEN ${from} AND ${to}`);

  const [[revenue], byStatus, byDay, topProducts, [allTime], upcoming, [review]] = await Promise.all([
    db
      .select({
        grossCents: sql<number>`COALESCE(SUM(${orders.amountPaidCents}), 0)::bigint`,
        refundedCents: sql<number>`COALESCE(SUM(${orders.amountRefundedCents}), 0)::bigint`,
        paidOrders: count(),
        deliveryFeesCents: sql<number>`COALESCE(SUM(${orders.deliveryFeeCents}), 0)::bigint`,
      })
      .from(orders)
      .where(paidInRange),
    db
      .select({ status: orders.status, count: count() })
      .from(orders)
      .where(sql`${createdDay} BETWEEN ${from} AND ${to}`)
      .groupBy(orders.status),
    db
      .select({
        date: sql<string>`${paidDay}::text`,
        orders: count(),
        grossCents: sql<number>`COALESCE(SUM(${orders.amountPaidCents}), 0)::bigint`,
        refundedCents: sql<number>`COALESCE(SUM(${orders.amountRefundedCents}), 0)::bigint`,
      })
      .from(orders)
      .where(paidInRange)
      .groupBy(paidDay)
      .orderBy(paidDay),
    db
      .select({
        productId: orderItems.productId,
        name: orderItems.productName,
        quantity: sql<number>`SUM(${orderItems.quantity})::int`,
        revenueCents: sql<number>`SUM(${orderItems.lineTotalCents})::bigint`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(paidInRange, inArray(orders.status, [...PAID_STATUSES])))
      .groupBy(orderItems.productId, orderItems.productName)
      .orderBy(desc(sql`SUM(${orderItems.lineTotalCents})`))
      .limit(10),
    db
      .select({
        grossCents: sql<number>`COALESCE(SUM(${orders.amountPaidCents}), 0)::bigint`,
        refundedCents: sql<number>`COALESCE(SUM(${orders.amountRefundedCents}), 0)::bigint`,
        paidOrders: count(),
      })
      .from(orders)
      .where(isNotNull(orders.paidAt)),
    db
      .select({ date: sql<string>`${orders.deliveryDate}::text`, count: count() })
      .from(orders)
      .where(and(inArray(orders.status, ["paid", "in_design", "out_for_delivery"]), sql`${orders.deliveryDate} BETWEEN ${today} AND ${shift(today, 6)}`))
      .groupBy(orders.deliveryDate)
      .orderBy(orders.deliveryDate),
    db.select({ count: count() }).from(orders).where(isNotNull(orders.reviewReason)),
  ]);

  // bigint sums arrive as strings from pg; normalise.
  const n = (v: unknown) => Number(v ?? 0);
  const gross = n(revenue?.grossCents);
  const refunded = n(revenue?.refundedCents);
  const paidOrders = n(revenue?.paidOrders);

  return {
    range: { from, to, timeZone: tz },
    currency: site.currency,
    revenue: {
      grossCents: gross,
      refundedCents: refunded,
      netCents: gross - refunded,
      deliveryFeesCents: n(revenue?.deliveryFeesCents),
      paidOrders,
      averageOrderValueCents: paidOrders ? Math.round(gross / paidOrders) : 0,
    },
    ordersByStatus: Object.fromEntries(byStatus.map((r) => [r.status, n(r.count)])),
    revenueByDay: byDay.map((d) => ({ date: d.date, orders: n(d.orders), grossCents: n(d.grossCents), netCents: n(d.grossCents) - n(d.refundedCents) })),
    topProducts: topProducts.map((p) => ({ ...p, quantity: n(p.quantity), revenueCents: n(p.revenueCents) })),
    upcomingDeliveries: upcoming.map((u) => ({ date: u.date, orders: n(u.count) })),
    needsReview: n(review?.count),
    allTime: {
      grossCents: n(allTime?.grossCents),
      netCents: n(allTime?.grossCents) - n(allTime?.refundedCents),
      paidOrders: n(allTime?.paidOrders),
    },
  };
}
