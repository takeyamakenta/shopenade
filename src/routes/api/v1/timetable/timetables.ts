import type { APIEvent } from "@solidjs/start/server";

import { Timetable } from "@/@types/Timetable";
import { doGetTimetables } from "@/libs/busstop/getTimetables";
import { serializeError } from "@/libs/error/reportError";
import { adminAuth } from "@/libs/firebase/server";

export async function GET({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
    data?: Timetable[];
}> {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("pole_id");
        const routePatternids = url.searchParams.getAll("route_pattern_ids");
        const date = url.searchParams.get("date");
        const headers = request.headers;
        const token = headers.get("Authorization");
        let idToken: string | undefined = undefined;
        if (token) {
            idToken = token.replace("Bearer ", "");
            await adminAuth.verifyIdToken(idToken);
        }
        if (!id || !routePatternids?.length || !date) {
            throw new Error("id, route_pattern_ids and date are required");
        }
        return await doGetTimetables(id, routePatternids, date, idToken);
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
