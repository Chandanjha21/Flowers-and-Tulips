import { z } from "zod";
import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse, queryObject } from "@/server/http/handler";
import { lowStockReport } from "@/server/services/admin-inventory";

const query = z.object({ threshold: z.coerce.number().int().min(0).max(1000).default(5) });

export const GET = adminRoute(ANY_ADMIN, async (req) => lowStockReport(parse(query, queryObject(req)).threshold));
