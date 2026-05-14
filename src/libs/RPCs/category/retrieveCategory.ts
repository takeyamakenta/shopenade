"use server";

import {
    RetrieveCategoryResponse,
    doRetrieveCategory
} from "@/libs/category/retrieveCategory";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const retrieveCategory = async (integrationAccountID: number, categoryID: string, language: string = "en"): Promise<RetrieveCategoryResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doRetrieveCategory(integrationAccountID, categoryID, language);
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to retrieve category");
    }
};
