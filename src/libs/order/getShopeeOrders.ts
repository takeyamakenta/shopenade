import { Order } from "@/@types/ShopeeOrder";
import { getAuthSession } from "@/sessions/authSession";

export interface GetShopeeOrdersResponse {
    success: boolean;
    error?: string;
    data?: Order[];
}

export const doGetShopeeOrders = async (): Promise<GetShopeeOrdersResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/orders/shopee/`,
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
            data: Order[];
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
