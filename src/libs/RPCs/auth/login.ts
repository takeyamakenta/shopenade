import { ClientAuthData } from "@/@types/ClientAuthData";
import { doLogin } from "@/libs/auth/doLogin";
import { adminAuth } from "@/libs/firebase/server";
import { updateAuthSession } from "@/sessions/authSession";

export const login = async (idToken: string): Promise<ClientAuthData> => {
    "use server";
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    await updateAuthSession({
        idToken,
        uid: decodedToken.uid,
    });

    const result = await doLogin(idToken);
    if (result.success && result.clientData) {
        return result.clientData as ClientAuthData;
    } else {
        throw new Error(result.error ?? "Login failed");
    }
};

