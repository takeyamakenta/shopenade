import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import type { FetchEvent } from "@solidjs/start/server";

import { checkPrevilege } from "./libs/auth/checkPrevilege";
import { routePrevileges } from "./libs/const/routePrevileges";
import { getAuthSession } from "./sessions/authSession";

/**
 * onRequest の第1引数は Vinxi が渡す FetchEvent。
 * getRequestEvent() は await 後など非同期境界でコンテキストが失われ undefined になり得るため、認可ではこちらを使う。
 */
export default createMiddleware({
    onRequest: async (event: FetchEvent) => {
        const pathname = new URL(event.request.url).pathname;
        const matchedRoutePrevileges = routePrevileges.filter(({ pattern }) => {
            return pattern.test(pathname);
        });
        // 設定された権限ルートが見つからない場合は通過
        if (!matchedRoutePrevileges?.length) {
            return;
        }
        const authSession = await getAuthSession();
        // ログインしていない場合は401を返す
        if (!authSession?.role) {
            return redirect("/401");
        }
        // 権限が不足している場合は403を返す
        const hasPrevilege = matchedRoutePrevileges.some((routePrevilege) => {
            return (
                checkPrevilege(
                    authSession?.granted_previleges || [],
                    authSession?.role || null,
                    routePrevilege.group_code,
                    routePrevilege.previleges
                ) === true
            );
        });
        console.log("hasPrevilege", hasPrevilege);
        if (!hasPrevilege) {
            return redirect("/403");
        }
        return;
    },
});
