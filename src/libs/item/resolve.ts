import { ItemVariant } from "@/@types/ItemVariant";
import { Item } from "@/@types/Item";

export const resolveItemPlatform = (items: Item[] | undefined | null, itemVariant: ItemVariant | null
    | undefined
) => {
    if (!items || !itemVariant) return null;
    return (
        (items ?? [] as Item[])
            ?.flatMap((item) => item.item_platforms)
            ?.find(
                (platform) =>
                    (platform?.id ?? 0) ===
                    (itemVariant?.item_platform_id ?? 0)
            ) ?? null
    );
};

export const resolveItemPackingStyle = (items: Item[] | undefined | null, itemVariant: ItemVariant | null
    | undefined
) => {
    if (!items || !itemVariant) return null;
    return (
        (items ?? [] as Item[])
            ?.flatMap((item) => item.item_packing_styles)
            ?.find(
                (packingStyle) =>
                    (packingStyle?.id ?? 0) ===
                    (itemVariant.item_packing_style_id ?? 0)
            ) ?? null
    );
};

export const resolveItemSku = (items: Item[] | undefined | null, itemVariant: ItemVariant | null
    | undefined
) => {
    if (!items || !itemVariant) return null;
    return (
        (items ?? [] as Item[])
            ?.flatMap((item) => item.item_skus)
            ?.find(
                (sku) => (sku?.id ?? 0) === (itemVariant?.item_sku_id ?? 0)
            ) ?? null
    );
};