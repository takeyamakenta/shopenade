import type { APIEvent } from "@solidjs/start/server";

import { serializeError } from "@/libs/error/reportError";
import { doDeleteOneShotNotification } from "@/libs/notification/deleteOneShotNotification";
import { adminAuth } from "@/libs/firebase/server";

export async function DELETE({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const headers = request.headers;
        const token = headers.get("Authorization");
        if (!token) {
            throw new Error("Authorization header is required");
        }
        const idToken = token.replace("Bearer ", "");
        if (!idToken.length) {
            throw new Error("Invalid token");
        }
        await adminAuth.verifyIdToken(idToken);
        const url = new URL(request.url);
        const id = parseInt(url.searchParams.get("notification_id") || "0");
        if (!id) {
            throw new Error("notification_id is required");
        }
        return await doDeleteOneShotNotification(id, idToken);
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
