"use server";

import {
    GetShopeeOrdersResponse,
    doGetShopeeOrders
} from "@/libs/order/getShopeeOrders";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const getShopeeOrders = async (): Promise<GetShopeeOrdersResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doGetShopeeOrders();
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to get shopee shops");
    }
};
