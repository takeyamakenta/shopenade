import type { APIEvent } from "@solidjs/start/server";

import { ClientAuthData } from "@/@types/ClientAuthData";
import { doLogin } from "@/libs/auth/doLogin";
import { serializeError } from "@/libs/error/reportError";
import { adminAuth } from "@/libs/firebase/server";
import { updateAuthSession } from "@/sessions/authSession";

export async function GET({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
    clientData?: ClientAuthData;
}> {
    try {
        const url = new URL(request.url);
        const idToken = url.searchParams.get("id_token");
        if (!idToken) {
            throw new Error("id_token is required");
        }
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        console.log("decodedToken", decodedToken);

        await updateAuthSession({
            idToken,
            uid: decodedToken.uid,
        });
        return await doLogin(idToken);
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
