import type { APIEvent } from "@solidjs/start/server";

import { Pole } from "@/@types/Pole";
import { serializeError } from "@/libs/error/reportError";
import { poleRepository } from "@/repositories/poleRepository";

export async function GET({ request }: APIEvent): Promise<{
    success: boolean;
    error?: string;
    data?: Pole[];
}> {
    try {
        const url = new URL(request.url);
        const lat = parseFloat(url.searchParams.get("lat") || "0");
        const lng = parseFloat(url.searchParams.get("lng") || "0");
        const radius = parseInt(url.searchParams.get("radius") || "0");
        if (!lat || !lng || !radius) {
            throw new Error("lat and lng are required");
        }
        const poles = await poleRepository.getNearbyPoles(
            lat,
            lng,
            radius,
            1
        );
        return {
            success: true,
            data: poles,
        };
    } catch (error: unknown) {
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
        };
    }
}
