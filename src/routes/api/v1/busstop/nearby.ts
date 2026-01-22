import type { APIEvent } from "@solidjs/start/server";

import { Busstop } from "@/@types/Busstop";
import { serializeError } from "@/libs/error/reportError";
import { busstopRepository } from "@/repositories/busstopRepository";

export async function GET({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
    data?: Busstop[];
}> {
    try {
        const url = new URL(request.url);
        const lat = parseFloat(url.searchParams.get("lat") || "0");
        const lng = parseFloat(url.searchParams.get("lng") || "0");
        const radius = parseInt(url.searchParams.get("radius") || "0");
        if (!lat || !lng || !radius) {
            throw new Error("lat and lng are required");
        }
        const busstops = await busstopRepository.getNearbyBusstops(
            lat,
            lng,
            radius,
            1
        );
        return {
            success: true,
            data: busstops,
        };
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
