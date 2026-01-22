import type { APIEvent } from "@solidjs/start/server";

import { Busstop } from "@/@types/Busstop";
import { doGetBusstopsByHiragana } from "@/libs/busstop/getBusstopsByHiragana";
import { serializeError } from "@/libs/error/reportError";

export async function GET({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
    data?: Busstop[];
}> {
    try {
        const url = new URL(request.url);
        const hiragana = url.searchParams.get("hiragana");
        if (!hiragana) {
            throw new Error("hiragana is required");
        }
        return await doGetBusstopsByHiragana(hiragana);
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
