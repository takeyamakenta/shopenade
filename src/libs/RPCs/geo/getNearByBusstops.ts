"use server";

import { Busstop } from "@/@types/Busstop";
import { busstopRepository } from "@/repositories/busstopRepository";

export const getNearByBusstops = async (
    lat: number,
    lng: number,
    radius: number
): Promise<Busstop[]> => {
    return await busstopRepository.getNearbyBusstops(lat, lng, radius, 1);
};
