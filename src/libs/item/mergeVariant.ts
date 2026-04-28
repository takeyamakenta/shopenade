import { getAuthSession } from "@/sessions/authSession";

export interface MergeVariantResponse {
    success: boolean;
    error?: string;
}

export const doMergeVariant = async (toItemID: number, toItemPackingStyleID: number, toItemSkuID: number, fromItemVariantIDs: number[]): Promise<MergeVariantResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/items/merge_variant`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to_item_id: toItemID,
                to_item_packing_style_id: toItemPackingStyleID,
                to_item_sku_id: toItemSkuID,
                from_item_variant_ids: fromItemVariantIDs,
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
