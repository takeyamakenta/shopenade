import { Timetable } from "@/@types/Timetable";
import { signPayload } from "@/libs/auth/signPayload";

export const doGetBeforeTimetables = async (
    timetableId: number,
    day: string
): Promise<{
    success: boolean;
    error?: string;
    data?: Timetable[];
}> => {
    const query = `timetable_id=${timetableId}&day=${day}&timestamp=${Math.floor(Date.now() / 1000)}`;
    const signature = signPayload(query, process.env.SIGN_KEY!);
    const response = await fetch(
        `${process.env.BACKEND_URL}sj/v1/timetable/before?${query}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Signature": signature,
            },
        }
    );
    const data = (await response.json()) as Timetable[];
    if (response.ok) {
        return {
            success: response.ok,
            data: data,
        };
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};
