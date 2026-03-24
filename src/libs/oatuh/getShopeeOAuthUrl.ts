import { createHmac } from "crypto";

/**
 * Shopee Open Platform の Shop 認可 URL を生成する
 * @see https://open.shopee.com/developer-guide/20
 */
export function getShopeeOAuthUrl(redirectUrl: string): string {
    const partnerId = String(process.env.SHOPEE_PARTNER_ID);
    const partnerKey = process.env.SHOPEE_PARTNER_KEY ?? "";

    if (!partnerId || !partnerKey) {
        throw new Error(
            "SHOPEE_PARTNER_ID and SHOPEE_PARTNER_KEY must be set in environment variables"
        );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const baseString = `${partnerId}/api/v2/shop/auth_partner${timestamp}`;
    const sign = createHmac("sha256", partnerKey)
        .update(baseString)
        .digest("hex");

    const params = new URLSearchParams({
        partner_id: String(partnerId),
        timestamp: String(timestamp),
        sign,
        redirect: redirectUrl,
    });

    return `${process.env.SHOPEE_BASE_URL}/api/v2/shop/auth_partner?${params.toString()}`;
}
