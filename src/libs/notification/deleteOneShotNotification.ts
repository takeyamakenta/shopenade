import { signPayload } from "@/libs/auth/signPayload";

export const doDeleteOneShotNotification = async (
    id: number,
    idToken: string,
): Promise<{ success: boolean; error?: string }> => {
    console.log(id);
    const payload = {
        id: id,
    };
    const serializedPayload = JSON.stringify(payload);
    const signature = signPayload(serializedPayload, process.env.SIGN_KEY!);
    const response = await fetch(
        `${process.env.BACKEND_URL}a/v1/notification/oneshot`,
        {
            method: "DELETE",
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
