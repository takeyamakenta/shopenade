"use server";

import {
    RetrieveCategoriesToRootResponse,
    doRetrieveCategoriesToRoot
} from "@/libs/category/retrieveCategoriesToRoot";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const retrieveCategoriesToRoot = async (integrationAccountID: number, categoryID: string, language: string = "en"): Promise<RetrieveCategoriesToRootResponse> => {
    if (!(await checkLoggedIn())) {
        throw new Error("not logged in");
    }
    const result = await doRetrieveCategoriesToRoot(integrationAccountID, categoryID, language);
    if (result.success) {
        return result;
    } else {
        throw new Error(result.error ?? "Failed to retrieve category");
    }
};
