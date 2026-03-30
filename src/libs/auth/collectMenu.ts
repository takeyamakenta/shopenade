import { GrantedPrevilege } from "@/@types/GrantedPrevilege";
import { RoutePrevilege } from "@/@types/RoutePrevilege";
import { MenuItem } from "@/@types/MenuItem";
import { Role } from "@/@types/Role";
import { appId as defaultAppId } from "@/const/appId";
import { icons } from "@/libs/const/icons";
import { MessageCircleQuestion } from "lucide-solid";
export const collectMenu = (
    grantedPrevileges: GrantedPrevilege[],
    routePrevileges: RoutePrevilege[],
    loggedInRole: Role | null,
    appId: number | null = null
): { [key: string]: MenuItem[] } | null => {
    if (appId === null) {
        appId = defaultAppId;
    }
    if (loggedInRole === null) {
        return null;
    }
    const collected = routePrevileges.reduce((acc: { [key: string]: MenuItem[] }, routePrevilege) => {     
        if (grantedPrevileges.some((grantedPrevilege) => {
            return (
                (
                grantedPrevilege.app_id === appId &&
                grantedPrevilege.group_code === routePrevilege.group_code &&
                grantedPrevilege.group_is_public === false &&
                grantedPrevilege.group_owner_company_id === loggedInRole.owner_company_id
                ) || (
                    grantedPrevilege.app_id === appId &&
                    grantedPrevilege.group_code === routePrevilege.group_code &&
                    grantedPrevilege.group_is_public === true
                )
            ) && (routePrevilege.show_menu_previleges ?? []).includes(grantedPrevilege.previlege);
        })) {
            if (!acc[routePrevilege.group_code]) {
                acc[routePrevilege.group_code] = [];
            }
            acc[routePrevilege.group_code].push({
                menu_description: routePrevilege.menu_description,
                menu_icon: routePrevilege.menu_icon,
                path: routePrevilege.path,
                icon: icons[routePrevilege.menu_icon as keyof typeof icons] ?? MessageCircleQuestion,
            });
        }
        return acc;
    }, {} as { [key: string]: MenuItem[] });
    // Object.entries(collected).forEach(([groupCode, menuItems]) => {
    //     // menuItems を pathでuniqにする
    //     const uniqueMenuItems = menuItems.filter((menuItem, index, self) =>
    //         index === self.findIndex((t) => t.path === menuItem.path)
    //     );
    //     collected[groupCode] = uniqueMenuItems;
    // });
    console.log("collected", collected);
    return collected;
};
