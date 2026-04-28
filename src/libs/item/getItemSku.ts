import { ItemSku } from "@/@types/ItemSku";
import { getAuthSession } from "@/sessions/authSession";

export interface GetItemSkuResponse {
    success: boolean;
    error?: string;
    data?: ItemSku;
}

export const doGetItemSku = async (integrationAccountID: number, internalSkuCode: string): Promise<GetItemSkuResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/items/skus/${integrationAccountID}/${internalSkuCode}`,
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
            data: ItemSku;
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
