import { signPayload } from "@/libs/auth/signPayload";
import { Busstop } from "@/@types/Busstop";

export const doGetBusstopsByHiragana = async (hiragana: string): Promise<{
    success: boolean;
    error?: string;
    data?: Busstop[];
}> => {
    const query = `hiragana=${hiragana}&timestamp=${Math.floor(Date.now()/1000)}`;
    const signature = signPayload(query, process.env.SIGN_KEY!);
    const response = await fetch(
        `${process.env.BACKEND_URL}s/v1/busstops/hiragana?${query}`,
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
            data: await response.json() as Busstop[],
        };
    } else {
        return {
            success: false,
            error: await response.text(),
        };
    }
};