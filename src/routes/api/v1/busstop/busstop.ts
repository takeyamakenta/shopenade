import type { APIEvent } from "@solidjs/start/server";

import { Busstop } from "@/@types/Busstop";
import { doGetBusstopData } from "@/libs/busstop/getBusstopData";
import { serializeError } from "@/libs/error/reportError";

export async function GET({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
    data?: Busstop;
}> {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) {
            throw new Error("id is required");
        }
        return await doGetBusstopData(id);
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
