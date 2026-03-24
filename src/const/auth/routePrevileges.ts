import type { RoutePrevilege } from "@/@types/RoutePrevilege";

export const routePrevileges: RoutePrevilege[] = [
        {
            path: "/",
            pattern: /^\/[^/]*$/,
            group_code: "TEST_GROUP",
            previleges: ["SUPER", "USER"],
            show_menu_previleges: ["SUPER", "USER"],
            menu_description: "Home",
            menu_icon: "home",
        },
        {
            path: "/account",
            pattern: /^\/account[^/]*$/,
            group_code: "TEST_GROUP",
            previleges: ["SUPER"],
            show_menu_previleges: ["SUPER"],
            menu_description: "アカウント設定",
            menu_icon: "map",
        },
    ];
