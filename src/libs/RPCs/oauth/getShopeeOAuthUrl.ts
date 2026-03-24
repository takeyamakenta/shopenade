"use server";

import { getShopeeOAuthUrl as doGetShopeeOAuthUrl } from "@/libs/oatuh/getShopeeOAuthUrl";
import { checkLoggedIn } from "@/libs/auth/checkLoggedIn";

export const getShopeeOAuthUrl = async (): Promise<string> => {
    if (!await checkLoggedIn()) {
        throw new Error("not logged in");
    }
    return doGetShopeeOAuthUrl(`${process.env.HOST_URL}/account`);
};
