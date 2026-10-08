import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse, queryObject } from "@/server/http/handler";
import { listOrders } from "@/server/services/admin-orders";
import { orderListQuery } from "@/server/validation/admin";

/**
 * Filters: status (repeatable), createdFrom/createdTo, deliveryFrom/deliveryTo (YYYY-MM-DD, studio time zone),
 * needsReview=true, q (order number, names, email), sort, page, pageSize.
 */
export const GET = adminRoute(ANY_ADMIN, async (req) => listOrders(parse(orderListQuery, queryObject(req))));
