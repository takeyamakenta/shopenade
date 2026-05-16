"use server";

import {
    RetrieveShopeeItemBaseInfoResponse,
    doRetrieveShopeeItemBaseInfo
} from "@/libs/item/shopee/retrieveItemBaseInfo";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const retrieveShopeeItemBaseInfo = async (integrationAccountID: number, itemID: string): Promise<RetrieveShopeeItemBaseInfoResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doRetrieveShopeeItemBaseInfo(integrationAccountID, itemID);
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to retrieve shopee item base info");
    }
};
