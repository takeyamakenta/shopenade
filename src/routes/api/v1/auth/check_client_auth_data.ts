import type { APIEvent } from "@solidjs/start/server";

import { AuthSessionData } from "@/@types/AuthSessionData";
import { ClientAuthData } from "@/@types/ClientAuthData";
import { doCheckClientAuthData } from "@/libs/auth/checkClientAuthData";
import { serializeError } from "@/libs/error/reportError";

export async function POST({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
    clientData?: ClientAuthData | null;
}> {
    try {
        const { id_token, uid } = (await request.json()) as {
            id_token: string;
            uid: string;
        };
        if (!id_token || !uid) {
            throw new Error("id_token and uid are required");
        }
        const authSession = {
            idToken: id_token,
            uid,
        } as AuthSessionData;
        const clientData = await doCheckClientAuthData(authSession);
        if (!clientData) {
            throw new Error("Failed to check client auth data");
        }
        return {
            success: true,
            clientData,
        };
    } catch (error: unknown) {
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
