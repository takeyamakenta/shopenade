"use server";

import { doPutOneShotNotification } from "@/libs/notification/putOneShotNotification";
import { adminAuth } from "@/libs/firebase/server";
import { useAuthSession } from "@/sessions/authSession";

export const putOneShotNotification = async (
    day: string,
    startTimetableId: number,
    endTimetableId: number,
    timetableFormerMins: number,
    id?: number | undefined
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
    const result = await doPutOneShotNotification(
        day,
        startTimetableId,
        endTimetableId,
        timetableFormerMins,
        idToken,
        id
    );
    if (result.success) {
        return true;
    } else {
        throw new Error(result.error);
    }
};
