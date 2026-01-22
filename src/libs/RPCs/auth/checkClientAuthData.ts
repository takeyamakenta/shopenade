"use server";

import { AuthSessionData } from "@/@types/AuthSessionData";
import { ClientAuthData } from "@/@types/ClientAuthData";
import { getAuthSession } from "@/sessions/authSession";

import { doCheckClientAuthData } from "../../auth/checkClientAuthData";

export const checkClientAuthData = async (): Promise<ClientAuthData | null> => {
    let authSession: AuthSessionData | null = null;
    try {
        authSession = await getAuthSession();
        if (!authSession?.idToken || !authSession?.uid) {
            return null;
        }
        return doCheckClientAuthData(authSession);
    } catch (e: unknown) {
        console.error(e);
        return null;
    }
};
