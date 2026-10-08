import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse, queryObject } from "@/server/http/handler";
import { getStats } from "@/server/services/admin-stats";
import { statsQuery } from "@/server/validation/admin";

/** Revenue, order counts, revenue by day, top products, upcoming deliveries. `from`/`to` default to the last 30 days. */
export const GET = adminRoute(ANY_ADMIN, async (req) => getStats(parse(statsQuery, queryObject(req))));
