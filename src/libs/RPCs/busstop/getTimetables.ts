"use server";

import { Timetable } from "@/@types/Timetable";
import { doGetTimetables } from "@/libs/busstop/getTimetables";
import { useAuthSession, clearAuthSession } from "@/sessions/authSession";
import { adminAuth } from "@/libs/firebase/server";
import { serializeError } from "@/libs/error/reportError";

export const getTimetables = async (
    poleId: string,
    routePatternids: string[],
    date: string
): Promise<Timetable[]> => {
    const authSession = await useAuthSession();
    let idToken: string | undefined = authSession?.data.idToken;
    if (idToken) {
        try {
            await adminAuth.verifyIdToken(idToken);
        } catch (error: unknown) {
            const msg = serializeError(error);
            if (msg.includes("Firebase ID token has expired")) {
                console.log("Token expired, clearing auth session");
                await clearAuthSession();
                idToken = undefined;
            } else {
                throw new Error(msg);
            }
        }
    }
    const result = await doGetTimetables(poleId, routePatternids, date, idToken);
    if (result.success) {
        return result.data ?? [];
    } else {
        throw new Error(result.error ?? "Failed to get timetables");
    }
};
