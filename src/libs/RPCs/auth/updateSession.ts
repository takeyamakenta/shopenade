"use server";

import { updateAuthSession } from "@/sessions/authSession";
import { AuthSessionData } from "@/@types/AuthSessionData";

export const updateSession = async (data: Partial<AuthSessionData>): Promise<void> => {
    await updateAuthSession(data);
    return;
};
