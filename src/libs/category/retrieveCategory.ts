import { Category } from "@/@types/Category";
import { getAuthSession } from "@/sessions/authSession";

export interface RetrieveCategoryResponse {
    success: boolean;
    error?: string;
    data?: Category;
}

export const doRetrieveCategory = async (integrationAccountID: number, categoryID: string, language: string = "en"): Promise<RetrieveCategoryResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/items/shopee/categories/${categoryID}?integration_account_id=${integrationAccountID}&language=${language}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
        }
    );
    if (response.ok) {
        const result = (await response.json()) as {
            success: boolean;
            data: Category;
        };
        return {
            success: response.ok,
            data: result.data,
        };
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};
