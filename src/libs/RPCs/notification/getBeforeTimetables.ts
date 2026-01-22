"use server";

import { Timetable } from "@/@types/Timetable";
import { doGetBeforeTimetables } from "@/libs/notification/getBeforeTimetables";

export const getBeforeTimetables = async (
    timetableId: number,
    day: string
): Promise<Timetable[]> => {
    const result = await doGetBeforeTimetables(timetableId, day);
    if (result.success) {
        return result.data ?? [];
    } else {
        throw new Error(result.error ?? "Failed to get before timetables");
    }
};
