"use server";

import { CreateShopeeShopAccountResponse } from "@/libs/oatuh/createShopeeShopAccount";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";
import { doCreateShopeeShopAccount } from "@/libs/oatuh/createShopeeShopAccount";

export const createShopeeShopAccount = async (shopId: string, code: string): Promise<CreateShopeeShopAccountResponse> => {
    if (!await checkLoggedIn()) {
        throw new Error("ログインしていません");
    }

    const result = await doCreateShopeeShopAccount(
        shopId,
        code
    );
    if (result.success) {
        return result.data ?? {} as { success: boolean };
    } else {
        throw new Error(result.error ?? "Failed to create shopee shop account");
    }
};