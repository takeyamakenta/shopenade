import { signPayload } from "@/libs/auth/signPayload";
import { Busstop } from "@/@types/Busstop";

export const doGetBusstopData = async (id: string): Promise<{
    success: boolean;
    error?: string;
    data?: Busstop;
}> => {
    const query = `id=${id}&timestamp=${Math.floor(Date.now()/1000)}`;
    const signature = signPayload(query, process.env.SIGN_KEY!);
    const response = await fetch(
        `${process.env.BACKEND_URL}s/v1/busstop?${query}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Signature": signature,
            },
        }
    );
    if (response.ok) {
        return {
            success: response.ok,
            data: await response.json() as Busstop,
        };
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};