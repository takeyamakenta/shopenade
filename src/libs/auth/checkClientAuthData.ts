import { AuthSessionData } from "@/@types/AuthSessionData";
import { ClientAuthData } from "@/@types/ClientAuthData";
import { doLogin } from "@/libs/auth/doLogin";
import { sessionRepository } from "@/repositories/sessionRepository";
import { adminAuth } from "@/libs/firebase/server";

export const doCheckClientAuthData = async (
    authSession: AuthSessionData | null = null,
    isRetry: boolean = false
): Promise<ClientAuthData | null> => {
    try {
        if (!authSession?.idToken || !authSession?.uid) {
            throw new Error("Auth session data is not found");
        }
        try {
            await adminAuth.verifyIdToken(authSession.idToken);
            const session = await sessionRepository.get(authSession.uid);
            if (!session) {
                throw new Error("user credentials is not found");
            }
            const clientData: ClientAuthData = {
                customToken: session.customToken,
                uid: authSession.uid,
                email: session.email,
            };
            return clientData;
        } catch (e: unknown) {
            console.log(e);
            if (isRetry) {
                throw e;
            }
            console.log("re-login...");
            const loginResult = await doLogin(authSession.idToken);
            if (!loginResult.success || !loginResult.data) {
                throw new Error("Failed to re-login");
            }
            // 再ログイン後のセッションを取得
            authSession.idToken = loginResult.data.idToken;
            authSession.uid = loginResult.data.uid;

            const clientAuthData = await doCheckClientAuthData(
                authSession,
                true
            );
            return clientAuthData;
        }
    } catch (e: unknown) {
        console.error(e);
        return null;
    }
};
