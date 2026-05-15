import { AttributeTreeCategory } from "@/@types/AttributeTreeCategory";
import { getAuthSession } from "@/sessions/authSession";

export interface RetrieveAttributeTreeResponse {
    success: boolean;
    error?: string;
    data?: AttributeTreeCategory;
}

export const doRetrieveAttributeTree = async (
    integrationAccountID: number,
    categoryID: string,
    language: string = "en"
): Promise<RetrieveAttributeTreeResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/items/shopee/categories/attribute_tree/${categoryID}?integration_account_id=${integrationAccountID}&language=${language}`,
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
            data: AttributeTreeCategory;
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
