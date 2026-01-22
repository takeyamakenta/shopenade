"use server";

import { clearAuthSession } from "@/sessions/authSession";

export const clearSession = async (): Promise<void> => {
    await clearAuthSession();
    return;
};
