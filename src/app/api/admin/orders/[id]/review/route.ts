import { OWNER, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { clearOrderReview } from "@/server/services/admin-orders";
import { uuidParam } from "@/server/validation/admin";

/** Owner: mark a flagged order (e.g. payment mismatch) as reviewed. */
export const DELETE = adminRoute<{ id: string }>(OWNER, async (_req, { params, actor }) => clearOrderReview(parse(uuidParam, params).id, actor));
