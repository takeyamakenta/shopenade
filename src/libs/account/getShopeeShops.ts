import { IntegrationAccount } from "@/@types/IntegrationAccount";
import { getAuthSession } from "@/sessions/authSession";

export interface GetShopeeShopsResponse {
    success: boolean;
    error?: string;
    data?: IntegrationAccount[];
}

export const doGetShopeeShops = async (): Promise<GetShopeeShopsResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    console.log({ "getShopeeShops": authSession });
    console.log({ idToken });
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/accounts/shopee_shops/?partner_id=${process.env.SHOPEE_PARTNER_ID}`,
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
            data: IntegrationAccount[];
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
