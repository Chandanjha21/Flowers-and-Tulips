import { OWNER, adminRoute } from "@/server/http/admin";
import { parse, queryObject } from "@/server/http/handler";
import { listAuditLogs } from "@/server/services/admin-users";
import { auditListQuery } from "@/server/validation/admin";

export const GET = adminRoute(OWNER, async (req) => listAuditLogs(parse(auditListQuery, queryObject(req))));
