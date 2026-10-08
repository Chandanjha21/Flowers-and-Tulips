import type { OrderStatus } from "@/server/db/schema";

/*
 * Which status changes an admin may make by hand. Payment-driven changes
 * (pending_payment -> paid/expired, anything -> refunded) only come from Stripe events.
 */
const ADMIN_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_payment: ["cancelled"],
  paid: ["in_design", "out_for_delivery", "delivered"],
  in_design: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered", "in_design"],
  delivered: [],
  cancelled: [],
  expired: [],
  refunded: [],
};

export const canAdminTransition = (from: OrderStatus, to: OrderStatus) => ADMIN_TRANSITIONS[from].includes(to);
export const adminNextStatuses = (from: OrderStatus) => ADMIN_TRANSITIONS[from];

/** Statuses that count as revenue. */
export const PAID_STATUSES = ["paid", "in_design", "out_for_delivery", "delivered"] as const satisfies readonly OrderStatus[];

/** Orders that can be refunded through Stripe. */
export const REFUNDABLE_STATUSES = PAID_STATUSES;
