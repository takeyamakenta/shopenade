import { createMiddleware } from "@solidjs/start/middleware";
import { getRequestEvent } from "solid-js/web";

import { routePrevileges } from "./const/auth/routePrevileges";
import { checkPrevilege } from "./libs/auth/checkPrevilege";
import { getAuthSession } from "./sessions/authSession";
export default createMiddleware({
  onRequest: async () => {
    const authSession = await getAuthSession();
    const pathname = new URL(getRequestEvent()?.request?.url || "").pathname;
    const routePrevilege = routePrevileges.find(({ pattern }) => {
      return pattern.test(pathname);
    });
    // ルートが見つからない場合は通過
    if (!routePrevilege) {
      return;
    }
    // 権限が不足している場合は403を返す
    const hasPrevilege = checkPrevilege(authSession?.granted_previleges || [], authSession?.role || null, routePrevilege.group_code, routePrevilege.previleges);
    if (!hasPrevilege) {
      return new Response("Forbidden", { status: 403 });
    }
    return;
  },
});