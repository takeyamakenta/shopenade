import { getAuthSession } from "@/sessions/authSession";

export interface SetVariantStockResponse {
    success: boolean;
    error?: string;
}

export const doSetVariantStock = async (itemVariantID: number, onhandStockNumber: number): Promise<SetVariantStockResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/items/variants/stock/set`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                item_variant_id: itemVariantID,
                on_hand_stock: onhandStockNumber,
            }),
        }
    );
    if (response.ok) {
        return {
            success: response.ok,
        };
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};
