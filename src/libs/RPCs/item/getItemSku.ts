"use server";

import {
    GetItemSkuResponse,
    doGetItemSku
} from "@/libs/item/getItemSku";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const getItemSku = async (integrationAccountID: number, internalSkuCode: string): Promise<GetItemSkuResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doGetItemSku(integrationAccountID, internalSkuCode);
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to get items");
    }
};
