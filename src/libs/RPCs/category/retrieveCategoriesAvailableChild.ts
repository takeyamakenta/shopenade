"use server";

import {
    RetrieveCategoriesAvailableChildResponse,
    doRetrieveCategoriesAvailableChild
} from "@/libs/category/retrieveCategoriesAvailableChild";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const retrieveCategoriesAvailableChild = async (integrationAccountID: number, categoryID: string, language: string = "en"): Promise<RetrieveCategoriesAvailableChildResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doRetrieveCategoriesAvailableChild(integrationAccountID, categoryID, language);
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to retrieve category");
    }
};
