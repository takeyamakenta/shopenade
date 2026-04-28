"use server";

import {
    MergeVariantResponse,
    doMergeVariant
} from "@/libs/item/mergeVariant";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const mergeVariant = async (toItemID: number, toItemPackingStyleID: number, toItemSkuID: number, fromItemVariantIDs: number[]): Promise<MergeVariantResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doMergeVariant(toItemID, toItemPackingStyleID, toItemSkuID, fromItemVariantIDs);
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to get items");
    }
};
