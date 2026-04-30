import { getAuthSession } from "@/sessions/authSession";
import { Item } from "@/@types/Item";

export interface MergeVariantResponse {
    success: boolean;
    error?: string;
    data?: {
        merged_item: Item;
        spliced_item: Item;
    };
}

export const doMergeVariant = async (toItemID: number, toItemPackingStyleID: number, toItemSkuID: number, fromItemVariantIDs: number[]): Promise<MergeVariantResponse> => {
    const authSession = await getAuthSession();
    const idToken = authSession?.idToken;
    if (!idToken) {
        throw new Error("ログインしていません");
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}v1/items/variants/merge`,
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
        const responseData = (await response.json()) as {
            success: boolean;
            data: {
                merged_item: Item;
                spliced_item: Item;
            };
        };
        console.log({ responseData });
        return {
            success: response.ok,
            data: responseData.data,
        } as MergeVariantResponse;
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};
