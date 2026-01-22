import type { APIEvent } from "@solidjs/start/server";

import { Timetable } from "@/@types/Timetable";
import { doGetBeforeTimetables } from "@/libs/notification/getBeforeTimetables";
import { serializeError } from "@/libs/error/reportError";

export async function GET({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
    data?: Timetable[];
}> {
    try {
        const url = new URL(request.url);
        const id = parseInt(url.searchParams.get("timetable_id") || "0");
        const day = url.searchParams.get("day");
        if (!id || !day) {
            throw new Error("id and day are required");
        }
        return await doGetBeforeTimetables(id, day);
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
