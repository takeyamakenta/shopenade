"use server";

import { Pole } from "@/@types/Pole";
import { poleRepository } from "@/repositories/poleRepository";

export const getNearByPoles = async (
    lat: number,
    lng: number,
    radius: number
): Promise<Pole[]> => {
    return await poleRepository.getNearbyPoles(lat, lng, radius, 1);
};
