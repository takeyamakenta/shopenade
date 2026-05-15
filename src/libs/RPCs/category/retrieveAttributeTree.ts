"use server";

import {
    RetrieveAttributeTreeResponse,
    doRetrieveAttributeTree
} from "@/libs/category/retrieveAttributeTree";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const retrieveAttributeTree = async (integrationAccountID: number, categoryID: string, language: string = "en"): Promise<RetrieveAttributeTreeResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doRetrieveAttributeTree(integrationAccountID, categoryID, language);
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to retrieve category");
    }
};
