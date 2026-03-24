import { ShopeeShopAccount } from "@/@types/ShopeeShopAccount";

export type IntegrationAccount = {
    id: number;
    provider: string;
    account_identifier: string;
    display_name: string;
    credentials: Record<string, unknown>;
    metadata: Record<string, unknown>;
    status: string;
    token_expires_at: string|null;
    created_at: string;
    updated_at: string;
    company_id: number;
    cutoff_clock: string;
    shopee_shop_account: ShopeeShopAccount|null;
};