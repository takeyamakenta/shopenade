import type { APIEvent } from "@solidjs/start/server";

import { serializeError } from "@/libs/error/reportError";
import { doPutOneShotNotification } from "@/libs/notification/putOneShotNotification";
import { adminAuth } from "@/libs/firebase/server";

export async function POST({ request }: APIEvent): Promise<{
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
        const { day, start_timetable_id, end_timetable_id, timetable_former_mins, id } = (await request.json()) as {
            day: string;
            start_timetable_id: number;
            end_timetable_id: number;
            timetable_former_mins: number;
            id?: number;
        };
        if (!day || !start_timetable_id || !end_timetable_id || !timetable_former_mins) {
            throw new Error("day, start_timetable_id, end_timetable_id and timetable_former_mins are required");
        }
        return await doPutOneShotNotification(day, start_timetable_id, end_timetable_id, timetable_former_mins, idToken, id);
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
