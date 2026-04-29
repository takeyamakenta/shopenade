"use server";

import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";
import {
    SetVariantStockResponse,
    doSetVariantStock,
} from "@/libs/item/setVariantStock";

export const setVariantStock = async (
    itemVariantID: number,
    onhandStockNumber: number
): Promise<SetVariantStockResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doSetVariantStock(itemVariantID, onhandStockNumber);
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to get items");
    }
};
