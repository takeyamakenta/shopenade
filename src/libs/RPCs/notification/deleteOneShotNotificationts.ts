"use server";

import { doDeleteOneShotNotification } from "@/libs/notification/deleteOneShotNotification";
import { adminAuth } from "@/libs/firebase/server";
import { useAuthSession } from "@/sessions/authSession";

export const deleteOneShotNotification = async (
    id: number,
): Promise<boolean> => {
    const authSession = await useAuthSession();
    if (!authSession) {
        throw new Error("No auth session");
    }
    const idToken = authSession.data.idToken;
    if (!idToken) {
        throw new Error("No idToken");
    }
    await adminAuth.verifyIdToken(idToken);
    const result = await doDeleteOneShotNotification(id, idToken);
    if (result.success) {
        return true;
    } else {
        throw new Error(result.error);
    }
};
