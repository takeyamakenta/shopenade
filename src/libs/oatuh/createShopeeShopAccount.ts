import { getAuthSession } from "@/sessions/authSession";

export interface CreateShopeeShopAccountResponse {
    success: boolean;
    error?: string;
    data?: {
        success: boolean;
    }
}

export const doCreateShopeeShopAccount = async (shopId: string, code: string): Promise<CreateShopeeShopAccountResponse> => {
    const payload = {
        partner_id: process.env.SHOPEE_PARTNER_ID,
        shop_id: shopId,
        code: code,
    };
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/accounts/shopee_shops/authorize`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );
    if (response.ok) {
        return {
            success: response.ok,
            data: await response.json() as { success: boolean },
        };
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};