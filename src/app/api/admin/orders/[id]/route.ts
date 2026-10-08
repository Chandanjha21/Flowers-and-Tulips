import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { getOrder } from "@/server/services/admin-orders";
import { uuidParam } from "@/server/validation/admin";

/** Order with items, status history and the statuses it can move to next. */
export const GET = adminRoute<{ id: string }>(ANY_ADMIN, async (_req, { params }) => getOrder(parse(uuidParam, params).id));
