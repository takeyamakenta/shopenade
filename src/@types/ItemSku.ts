import { ItemImage } from "./ItemImage";

export type ItemSku = {
    id: number;
    pindex: number;
    pattern_4points: string;
    pattern_6points: string;
    internal_sku_code: string;
    shopee_sku_code: string;
    external_shopee_sku_code: string;
    rakuten_sku_code: string;
    yahoo_sku_code: string;
    description: string;
    hash_code: string;
    images: ItemImage[]|null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    item_id: number;
};

