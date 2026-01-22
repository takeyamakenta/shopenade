"use server";

import { doGetBusstopsByHiragana } from "@/libs/busstop/getBusstopsByHiragana";
import { Busstop } from "@/@types/Busstop";

export const getBusstopsByHiragana = async (hiragana: string): Promise<Busstop[]> => {
    const result = await doGetBusstopsByHiragana(hiragana);
    if (result.success) {
        return result.data ?? [] as Busstop[];
    } else {
        throw new Error(result.error ?? "Failed to get busstop data");
    }
};