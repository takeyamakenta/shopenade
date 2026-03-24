"use server";

import {
    GetShopeeShopsResponse,
    doGetShopeeShops,
} from "@/libs/account/getShopeeShops";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const getShopeeShops = async (): Promise<GetShopeeShopsResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doGetShopeeShops();
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to get shopee shops");
    }
};
