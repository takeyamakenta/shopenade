import type { Timetable } from "@/@types/Timetable";

export function findTimetableById(id: string | null | undefined, timetables: Timetable[]): Timetable | undefined {
    if (id === null || id === undefined) {
        return undefined;
    }
    return timetables.find((timetable) => timetable.id.toString() === id);
}