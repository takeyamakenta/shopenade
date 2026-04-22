"use server";

import {
    GetItemsResponse,
    doGetItems
} from "@/libs/item/getItems";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const getItems = async (): Promise<GetItemsResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doGetItems();
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to get items");
    }
};
