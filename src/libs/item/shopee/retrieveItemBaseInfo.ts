import { ShopeeItemBaseInfo } from "@/@types/ShopeeItemBaseInfo";
import { getAuthSession } from "@/sessions/authSession";

export interface RetrieveShopeeItemBaseInfoResponse {
    success: boolean;
    error?: string;
    data?: ShopeeItemBaseInfo;
}

export const doRetrieveShopeeItemBaseInfo = async (integrationAccountID: number, itemID: string): Promise<RetrieveShopeeItemBaseInfoResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/items/shopee/base_info/${itemID}?integration_account_id=${integrationAccountID}`,
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
            data: ShopeeItemBaseInfo;
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
