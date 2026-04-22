export type ItemPlatform = {
    id: number;
    platform: string;
    internal_item_code: string;
    shopee_item_code: string|null;
    external_shopee_item_code: string|null;
    rakuten_item_code: string|null;
    yahoo_item_code: string|null;
    description: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    item_id: number;
    integration_account_id: number;
};
