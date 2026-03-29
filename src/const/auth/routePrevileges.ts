import type { RoutePrevilege } from "@/@types/RoutePrevilege";

export const routePrevileges: RoutePrevilege[] = [
        {
            path: "/account",
            pattern: /^\/account[^/]*$/,
            group_code: "TEST_GROUP",
            previleges: ["SUPER"],
            show_menu_previleges: ["SUPER"],
            menu_description: "アカウント設定",
            menu_icon: "map",
        },
        {
            path: "/account",
            pattern: /^\/account[^/]*$/,
            group_code: "TEST_GROUP2",
            previleges: ["SUPER"],
            show_menu_previleges: ["SUPER"],
            menu_description: "アカウント設定",
            menu_icon: "map",
        },
    ];
