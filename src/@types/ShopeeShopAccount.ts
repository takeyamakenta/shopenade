export type ShopeeShopAccount = {
    id: number;
    shop_id: string;
    merchant_id: string | null;
    shop_name: string;
    region: string;
    access_token_expires_at: string;
    refresh_token_expires_at: string;
    environment: string;
    last_token_refresh_at: string;
    last_api_call_at: string;
    authorization_status: string;
    created_at: string;
    updated_at: string;
    integration_account_id: number;
};