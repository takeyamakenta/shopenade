import type { RoutePrevilege } from "@/@types/RoutePrevilege";

export const makePrevilegesForGroupCode = (routePrevileges: RoutePrevilege[]): { [key: string]: string[] } | null => {
    const dict = routePrevileges.reduce((acc, routePrevilege) => {
        if (routePrevilege.group_code === null) {
            return acc;
        }
        acc[routePrevilege.group_code] = [...(acc[routePrevilege.group_code] ?? []), ...(routePrevilege.previleges ?? [])];
        return acc;
    }, {} as { [key: string]: string[] });
    if (Object.keys(dict).length === 0) {
        return null;
    }
    return dict;
};