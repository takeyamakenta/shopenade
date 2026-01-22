"use server";

import { doGetBusstopData } from "@/libs/busstop/getBusstopData";
import { Busstop } from "@/@types/Busstop";

export const getBusstopData = async (id: string): Promise<Busstop> => {
    const result = await doGetBusstopData(id);
    if (result.success) {
        return result.data ?? {} as Busstop;
    } else {
        throw new Error(result.error ?? "Failed to get busstop data");
    }
};