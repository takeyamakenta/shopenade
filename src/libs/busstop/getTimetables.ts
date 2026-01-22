import { signPayload } from "@/libs/auth/signPayload";
import { Timetable } from "@/@types/Timetable";

export const doGetTimetables = async (poleId: string, routePatternids: string[], date: string, idToken?: string): Promise<{
    success: boolean;
    error?: string;
    data?: Timetable[];
}> => {
    const query = `pole_id=${poleId}&${routePatternids.map(id => `route_pattern_ids=${id}`).join("&")}&day=${date}&timestamp=${Math.floor(Date.now()/1000)}`;
    console.log(query);
    const signature = signPayload(query, process.env.SIGN_KEY!);
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Signature": signature,
    };
    if (idToken?.length) {
        headers["Authorization"] = `Bearer ${idToken}`;
    }
    const response = await fetch(
        `${process.env.BACKEND_URL}sj/v1/busstop/timetable?${query}`,
        {
            method: "GET",
            headers,
        }
    );
    if (response.ok) {
        return {
            success: response.ok,
            data: await response.json() as Timetable[],
        };
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};