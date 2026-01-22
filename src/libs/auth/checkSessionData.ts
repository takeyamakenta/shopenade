import { AuthSessionData } from "@/@types/AuthSessionData";
import { UserCredentials } from "@/@types/UserCredentials";
import { sessionRepository } from "@/repositories/sessionRepository";

import { doLogin } from "@/libs/auth/doLogin";

export const checkSessionData = async (
    authSession: AuthSessionData | null = null,
    appUid: string,
    authToken: string,
    isRetry: boolean = false
): Promise<(UserCredentials & { customToken?: string }) | null> => {
    try {
        if (!authSession?.idToken || !authSession?.uid) {
            throw new Error("Session cookie data is not found");
        }
        try {
            const session = await sessionRepository.get(
                authSession.uid
            );
            if (!session) {
                throw new Error("user credentials is not found");
            }
            return session;
        } catch (e: unknown) {
            console.log(e);
            if (isRetry) {
                throw e;
            }
            console.log("re-login...");
            const { clientData } = await doLogin(
                authSession.idToken
            );
            return {
                ...checkSessionData(authSession, appUid, authToken, true),
                clientData,
            };
        }
    } catch (e: unknown) {
        console.error(e);
        return null;
    }
};
