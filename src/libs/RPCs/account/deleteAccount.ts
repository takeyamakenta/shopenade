"use server";

import { doDeleteAccount } from "@/libs/account/deleteAccount";
import { adminAuth } from "@/libs/firebase/server";
import { useAuthSession } from "@/sessions/authSession";

export const deleteAccount = async (
    uid: string,
): Promise<boolean> => {
    const authSession = await useAuthSession();
    if (!authSession) {
        throw new Error("No auth session");
    }
    const idToken = authSession.data.idToken;
    if (!idToken) {
        throw new Error("No idToken");
    }
    const verifyResult = await adminAuth.verifyIdToken(idToken);
    if (!verifyResult.uid) {
        throw new Error("No uid");
    }
    if (verifyResult.uid !== uid) {
        throw new Error("Invalid uid");
    }
    const result = await doDeleteAccount(uid, idToken);
    if (result.success) {
        return true;
    } else {
        throw new Error(result.error);
    }
};
