import { signPayload } from "@/libs/auth/signPayload";

export const doPutOneShotNotification = async (
    day: string,
    startTimetableId: number,
    endTimetableId: number,
    timetableFormerMins: number,
    idToken: string,
    id?: number | undefined,
): Promise<{ success: boolean; error?: string }> => {
    console.log(day, startTimetableId, endTimetableId, timetableFormerMins);
    const payload = {
        id: id,
        day,
        start_timetable_id: startTimetableId,
        end_timetable_id: endTimetableId,
        timetable_former_mins: timetableFormerMins,
    };

    const serializedPayload = JSON.stringify(payload);

    const signature = signPayload(serializedPayload, process.env.SIGN_KEY!);
    const response = await fetch(
        `${process.env.BACKEND_URL}a/v1/notification/oneshot`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Signature": signature,
                "Authorization": `Bearer ${idToken}`,
            },
            body: serializedPayload,
        }
    );
    if (response.ok) {
        return {
            success: response.ok,
        };
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};
